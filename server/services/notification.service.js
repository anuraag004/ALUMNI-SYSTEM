/**
 * services/notification.service.js
 * Creates in-app notifications in Firestore.
 * Socket.io notificationHandler emits these to connected clients.
 */

const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");

/**
 * Create a notification document for a user.
 * @param {string} recipientId - UID of the target user
 * @param {{ type: string, message: string, link?: string }} payload
 */
const create = async (recipientId, { type, message, link = "/" }) => {
    const notifId = uuidv4();
    const notif = {
        id: notifId,
        recipientId,
        type,
        message,
        link,
        isRead: false,
        createdAt: new Date(),
    };
    await db.collection("notifications").doc(notifId).set(notif);
    return notif;
};

/**
 * Fetch unread notifications for a user (max 50).
 */
const getUnread = async (uid) => {
    const snapshot = await db
        .collection("notifications")
        .where("recipientId", "==", uid)
        .where("isRead", "==", false)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();
    return snapshot.docs.map((d) => d.data());
};

/**
 * Mark a notification as read.
 */
const markRead = async (notifId) => {
    await db.collection("notifications").doc(notifId).update({ isRead: true });
};

module.exports = { create, getUnread, markRead };
