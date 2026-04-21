const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

exports.listConversations = async (req, res, next) => {
    try {
        const snapshot = await db
            .collection("conversations")
            .where("participants", "array-contains", req.user.uid)
            .get();

        const conversations = snapshot.docs.map((d) => d.data());
        conversations.sort((a, b) => b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis());

        const populated = await Promise.all(conversations.map(async (conv) => {
            const otherUid = conv.participants.find(id => id !== req.user.uid);
            if (!otherUid) return conv;
            const otherUser = await firestoreService.getDocument("users", otherUid);
            return {
                ...conv,
                recipientName: otherUser?.displayName || "Unknown User",
                recipientPhoto: otherUser?.photoURL || null
            };
        }));

        return successResponse(res, 200, "Conversations fetched", populated);
    } catch (err) {
        next(err);
    }
};

exports.createConversation = async (req, res, next) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) return errorResponse(res, 400, "recipientId is required");
        if (recipientId === req.user.uid) return errorResponse(res, 400, "Cannot start a conversation with yourself");

        const existing = await db
            .collection("conversations")
            .where("participants", "array-contains", req.user.uid)
            .get();

        const existingConv = existing.docs
            .map((d) => d.data())
            .find((c) => c.participants.includes(recipientId));

        if (existingConv) {
            const otherUid = existingConv.participants.find(id => id !== req.user.uid);
            const otherUser = await firestoreService.getDocument("users", otherUid);
            const populated = {
                ...existingConv,
                recipientName: otherUser?.displayName || "Unknown User",
                recipientPhoto: otherUser?.photoURL || null
            };
            return successResponse(res, 200, "Conversation already exists", populated);
        }

        const convId = uuidv4();
        const otherUser = await firestoreService.getDocument("users", recipientId);
        const conversation = {
            id: convId,
            participants: [req.user.uid, recipientId],
            lastMessage: "",
            lastMessageAt: new Date(),
            createdAt: new Date(),
        };

        await firestoreService.setDocument("conversations", convId, conversation);
        
        const populatedNew = {
            ...conversation,
            recipientName: otherUser?.displayName || "Unknown User",
            recipientPhoto: otherUser?.photoURL || null
        };
        return successResponse(res, 201, "Conversation created", populatedNew);
    } catch (err) {
        next(err);
    }
};

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
