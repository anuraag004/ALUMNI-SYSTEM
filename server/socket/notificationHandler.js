/**
 * socket/notificationHandler.js
 * Listens for notification-related events and delivers real-time pushes.
 *
 * Client events:
 *   get_notifications   → emits 'notifications' with unread list
 *   mark_notification_read { notifId }
 *
 * Internal usage:
 *   Call io.to(`user:${uid}`).emit('notification', notif)
 *   from any controller/service to push a live notification.
 */

"use strict";

const notificationService = require("../services/notification.service");

const notificationHandler = (io, socket) => {
    const { uid } = socket.user;

    // ── Fetch unread notifications on connect ─────────────────────────────────
    socket.on("get_notifications", async () => {
        try {
            const notifications = await notificationService.getUnread(uid);
            socket.emit("notifications", notifications);
        } catch (err) {
            console.error("[Socket:get_notifications]", err);
        }
    });

    // ── Mark a notification as read ───────────────────────────────────────────
    socket.on("mark_notification_read", async ({ notifId }) => {
        try {
            await notificationService.markRead(notifId);
            socket.emit("notification_marked_read", { notifId });
        } catch (err) {
            console.error("[Socket:mark_notification_read]", err);
        }
    });
};

module.exports = notificationHandler;
