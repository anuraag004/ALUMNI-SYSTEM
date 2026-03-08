/**
 * controllers/chat.controller.js
 * REST layer for chat — Socket.io handles real-time delivery.
 */
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

// ── List Conversations ────────────────────────────────────────────────────────
exports.listConversations = async (req, res, next) => {
    try {
        const snapshot = await db
            .collection("conversations")
            .where("participants", "array-contains", req.user.uid)
            .orderBy("lastMessageAt", "desc")
            .get();

        const conversations = snapshot.docs.map((d) => d.data());
        return successResponse(res, 200, "Conversations fetched", conversations);
    } catch (err) {
        next(err);
    }
};

// ── Create Conversation ───────────────────────────────────────────────────────
exports.createConversation = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) return errorResponse(res, 400, "recipientId is required");
        if (recipientId === req.user.uid) return errorResponse(res, 400, "Cannot start a conversation with yourself");

        // Check if conversation already exists
        const existing = await db
            .collection("conversations")
            .where("participants", "array-contains", req.user.uid)
            .get();

        const existingConv = existing.docs
            .map((d) => d.data())
            .find((c) => c.participants.includes(recipientId));

        if (existingConv) {
            return successResponse(res, 200, "Conversation already exists", existingConv);
        }

        const convId = uuidv4();
        const conversation = {
            id: convId,
            participants: [req.user.uid, recipientId],
            lastMessage: "",
            lastMessageAt: new Date(),
            createdAt: new Date(),
        };

        await firestoreService.setDocument("conversations", convId, conversation);
        return successResponse(res, 201, "Conversation created", conversation);
    } catch (err) {
        next(err);
    }
};

// ── Get Messages (paginated) ──────────────────────────────────────────────────
exports.getMessages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        const conv = await firestoreService.getDocument("conversations", id);
        if (!conv) return errorResponse(res, 404, "Conversation not found");
        if (!conv.participants.includes(req.user.uid)) {
            return errorResponse(res, 403, "Not a participant of this conversation");
        }

        const snapshot = await db
            .collection("conversations")
            .doc(id)
            .collection("messages")
            .orderBy("sentAt", "desc")
            .limit(parseInt(limit, 10))
            .get();

        const messages = snapshot.docs.map((d) => d.data()).reverse();
        return successResponse(res, 200, "Messages fetched", messages);
    } catch (err) {
        next(err);
    }
};
