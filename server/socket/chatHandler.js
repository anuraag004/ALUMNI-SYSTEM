/**
 * socket/chatHandler.js
 * Handles real-time messaging events for the chat module.
 *
 * Client events:
 *   join_conversation  { conversationId }
 *   send_message       { conversationId, text }
 *   typing             { conversationId }
 *   stop_typing        { conversationId }
 *   mark_read          { conversationId, messageId }
 *
 * Server events emitted:
 *   new_message        { message }
 *   user_typing        { uid }
 *   user_stop_typing   { uid }
 */

"use strict";

const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

const chatHandler = (io, socket) => {
    const { uid } = socket.user;

    // ── Join a conversation room ──────────────────────────────────────────────
    socket.on("join_conversation", async ({ conversationId }) => {
        if (!conversationId) return;

        // Verify the user is a participant
        const convDoc = await db.collection("conversations").doc(conversationId).get();
        if (!convDoc.exists) return;
        if (!convDoc.data().participants.includes(uid)) return;

        socket.join(`conv:${conversationId}`);
        socket.emit("joined_conversation", { conversationId });
    });

    // ── Send a message ────────────────────────────────────────────────────────
    socket.on("send_message", async ({ conversationId, text }) => {
        if (!conversationId || !text?.trim()) return;

        try {
            const msgId = uuidv4();
            const message = {
                id: msgId,
                senderId: uid,
                text: text.trim(),
                read: false,
                sentAt: new Date(),
            };

            // Persist to Firestore subcollection
            await db
                .collection("conversations")
                .doc(conversationId)
                .collection("messages")
                .doc(msgId)
                .set(message);

            // Update conversation metadata
            await db.collection("conversations").doc(conversationId).update({
                lastMessage: text.trim().slice(0, 100),
                lastMessageAt: new Date(),
            });

            // Broadcast to everyone in the room (including sender for confirmation)
            io.to(`conv:${conversationId}`).emit("new_message", { conversationId, message });
        } catch (err) {
            socket.emit("chat_error", { message: "Failed to send message" });
            console.error("[Socket:send_message]", err);
        }
    });

    // ── Typing indicators ─────────────────────────────────────────────────────
    socket.on("typing", ({ conversationId }) => {
        socket.to(`conv:${conversationId}`).emit("user_typing", { uid, conversationId });
    });

    socket.on("stop_typing", ({ conversationId }) => {
        socket.to(`conv:${conversationId}`).emit("user_stop_typing", { uid, conversationId });
    });

    // ── Mark message as read ──────────────────────────────────────────────────
    socket.on("mark_read", async ({ conversationId, messageId }) => {
        try {
            await db
                .collection("conversations")
                .doc(conversationId)
                .collection("messages")
                .doc(messageId)
                .update({ read: true });
        } catch (err) {
            console.error("[Socket:mark_read]", err);
        }
    });
};

module.exports = chatHandler;
