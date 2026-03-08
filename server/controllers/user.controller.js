/**
 * controllers/user.controller.js
 */
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

// ── Get User ──────────────────────────────────────────────────────────────────
exports.getUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const user = await firestoreService.getDocument("users", uid);
        if (!user) return errorResponse(res, 404, "User not found");
        return successResponse(res, 200, "User fetched", user);
    } catch (err) {
        next(err);
    }
};

// ── Update User ───────────────────────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
    try {
        const { uid } = req.params;

        // Only the owner or admin can update
        if (req.user.uid !== uid && req.user.role !== "admin") {
            return errorResponse(res, 403, "You can only update your own profile");
        }

        // Strip protected fields from body
        const {
            uid: _uid,
            email: _email,
            role: _role,
            isVerified: _iv,
            createdAt: _ca,
            ...allowedUpdates
        } = req.body;

        allowedUpdates.updatedAt = new Date();
        await firestoreService.updateDocument("users", uid, allowedUpdates);
        const updated = await firestoreService.getDocument("users", uid);

        return successResponse(res, 200, "Profile updated", updated);
    } catch (err) {
        next(err);
    }
};

// ── Delete User ───────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
    try {
        const { uid } = req.params;
        await firestoreService.deleteDocument("users", uid);
        return successResponse(res, 200, "User deleted successfully");
    } catch (err) {
        next(err);
    }
};
