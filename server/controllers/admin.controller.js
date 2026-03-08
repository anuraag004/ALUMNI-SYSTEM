/**
 * controllers/admin.controller.js
 * Platform analytics, user management, and verification.
 */
const { db, auth } = require("../config/firebase");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

// ── Platform Stats ────────────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
    try {
        // Run all counts in parallel
        const [usersSnap, alumniSnap, jobsSnap, eventsSnap, analysesSnap, requestsSnap] =
            await Promise.all([
                db.collection("users").get(),
                db.collection("users").where("role", "==", "alumni").get(),
                db.collection("jobs").where("isActive", "==", true).get(),
                db.collection("events").get(),
                db.collection("resumeAnalyses").get(),
                db.collection("mentorRequests").where("status", "==", "pending").get(),
            ]);

        const stats = {
            totalUsers: usersSnap.size,
            totalAlumni: alumniSnap.size,
            totalStudents: usersSnap.size - alumniSnap.size,
            activeJobs: jobsSnap.size,
            totalEvents: eventsSnap.size,
            resumeAnalysesCompleted: analysesSnap.size,
            pendingMentorRequests: requestsSnap.size,
        };

        return successResponse(res, 200, "Platform stats fetched", stats);
    } catch (err) {
        next(err);
    }
};

// ── List All Users ────────────────────────────────────────────────────────────
exports.listUsers = async (req, res, next) => {
    try {
        const { role, isVerified, page = 1, limit = 20 } = req.query;

        let query = db.collection("users");
        if (role) query = query.where("role", "==", role);
        if (isVerified !== undefined) query = query.where("isVerified", "==", isVerified === "true");

        const snapshot = await query.orderBy("createdAt", "desc").get();
        const users = snapshot.docs.map((d) => d.data());

        const total = users.length;
        const offset = (page - 1) * limit;
        const paginated = users.slice(offset, offset + parseInt(limit, 10));

        return res.status(200).json({
            success: true,
            data: paginated,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
        });
    } catch (err) {
        next(err);
    }
};

// ── Verify Alumni Account ─────────────────────────────────────────────────────
exports.verifyUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await firestoreService.getDocument("users", uid);
        if (!user) return errorResponse(res, 404, "User not found");

        await firestoreService.updateDocument("users", uid, { isVerified: true, verifiedAt: new Date() });
        return successResponse(res, 200, "User verified successfully");
    } catch (err) {
        next(err);
    }
};

// ── Change Role ───────────────────────────────────────────────────────────────
exports.changeUserRole = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const { role } = req.body;
        if (!["student", "alumni", "admin"].includes(role)) {
            return errorResponse(res, 400, "Invalid role");
        }
        await firestoreService.updateDocument("users", uid, { role });
        await auth.setCustomUserClaims(uid, { role });
        return successResponse(res, 200, "User role updated");
    } catch (err) {
        next(err);
    }
};

// ── Delete User (admin) ───────────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        await Promise.all([
            firestoreService.deleteDocument("users", uid),
            auth.deleteUser(uid),
        ]);
        return successResponse(res, 200, "User deleted from Firestore and Firebase Auth");
    } catch (err) {
        next(err);
    }
};
