/**
 * controllers/mentor.controller.js
 * AI mentor recommendations + mentor request lifecycle.
 */
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");
const mentorRecommender = require("../ai/mentorRecommender");
const notificationService = require("../services/notification.service");

// ── AI-Powered Recommendations ────────────────────────────────────────────────
exports.getRecommendations = async (req, res, next) => {
    try {
        const student = await firestoreService.getDocument("users", req.user.uid);
        if (!student) return errorResponse(res, 404, "Student profile not found");

        const recommendations = await mentorRecommender.recommend(student);
        return successResponse(res, 200, "Mentor recommendations fetched", recommendations);
    } catch (err) {
        next(err);
    }
};

// ── Send Mentor Request ───────────────────────────────────────────────────────
exports.sendRequest = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 422, "Validation failed", errors.array());

        const { mentorId, message, topics } = req.body;

        // Check mentor exists and is available
        const mentor = await firestoreService.getDocument("users", mentorId);
        if (!mentor || mentor.role !== "alumni") return errorResponse(res, 404, "Mentor not found");
        if (!mentor.isMentorAvailable) return errorResponse(res, 400, "Mentor is not accepting requests");

        const reqId = uuidv4();
        const mentorRequest = {
            id: reqId,
            studentId: req.user.uid,
            mentorId,
            message,
            topics: topics || [],
            status: "pending",
            createdAt: new Date(),
        };

        await firestoreService.setDocument("mentorRequests", reqId, mentorRequest);

        // Notify mentor
        await notificationService.create(mentorId, {
            type: "mentor_request",
            message: `New mentorship request from ${req.user.email}`,
            link: `/mentor/requests`,
        });

        return successResponse(res, 201, "Mentor request sent", mentorRequest);
    } catch (err) {
        next(err);
    }
};

// ── Get Incoming Requests (for alumni) ────────────────────────────────────────
exports.getMentorRequests = async (req, res, next) => {
    try {
        const { db } = require("../config/firebase");
        const snapshot = await db
            .collection("mentorRequests")
            .where("mentorId", "==", req.user.uid)
            .orderBy("createdAt", "desc")
            .get();

        const requests = snapshot.docs.map((d) => d.data());
        return successResponse(res, 200, "Mentor requests fetched", requests);
    } catch (err) {
        next(err);
    }
};

// ── Accept / Reject Request ───────────────────────────────────────────────────
exports.respondToRequest = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!["accepted", "rejected"].includes(status)) {
            return errorResponse(res, 400, "Status must be 'accepted' or 'rejected'");
        }

        const request = await firestoreService.getDocument("mentorRequests", req.params.id);
        if (!request) return errorResponse(res, 404, "Request not found");
        if (request.mentorId !== req.user.uid) return errorResponse(res, 403, "Not your request");

        await firestoreService.updateDocument("mentorRequests", req.params.id, {
            status,
            respondedAt: new Date(),
        });

        // Notify student
        await notificationService.create(request.studentId, {
            type: "mentor_request",
            message: `Your mentorship request was ${status}`,
            link: `/mentor`,
        });

        return successResponse(res, 200, `Request ${status}`);
    } catch (err) {
        next(err);
    }
};
