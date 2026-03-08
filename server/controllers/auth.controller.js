/**
 * controllers/auth.controller.js
 * Handles registration, login (Firebase token → JWT), logout, and getMe.
 */

const { validationResult } = require("express-validator");
const { auth } = require("../config/firebase");
const { signToken } = require("../utils/jwtHelper");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 422, "Validation failed", errors.array());

        const { idToken, displayName, role, graduationYear, department, bio } = req.body;

        if (!idToken) return errorResponse(res, 400, "Firebase idToken is required");

        // Verify the Firebase ID token
        const decoded = await auth.verifyIdToken(idToken);
        const { uid, email } = decoded;

        // Check if user already exists
        const existing = await firestoreService.getDocument("users", uid);
        if (existing) return errorResponse(res, 409, "User already registered");

        // Set custom claim for role (used by Firebase rules)
        await auth.setCustomUserClaims(uid, { role });

        // Create Firestore document
        const userData = {
            uid,
            email,
            displayName,
            role,
            graduationYear: graduationYear || null,
            department: department || null,
            bio: bio || "",
            photoURL: decoded.picture || null,
            linkedIn: "",
            skills: [],
            isVerified: role === "student", // students auto-verified; alumni need admin approval
            isMentorAvailable: false,
            mentorCapacity: 0,
            currentCompany: null,
            currentRole: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await firestoreService.setDocument("users", uid, userData);

        const token = signToken({ uid, email, role });
        return successResponse(res, 201, "Registration successful", { user: userData, token });
    } catch (err) {
        next(err);
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return errorResponse(res, 400, "Firebase idToken is required");

        const decoded = await auth.verifyIdToken(idToken);
        const { uid, email } = decoded;

        const userDoc = await firestoreService.getDocument("users", uid);
        if (!userDoc) return errorResponse(res, 404, "User not found. Please register first.");

        const token = signToken({ uid, email, role: userDoc.role });

        // Update last login timestamp
        await firestoreService.updateDocument("users", uid, { lastLoginAt: new Date() });

        return successResponse(res, 200, "Login successful", { user: userDoc, token });
    } catch (err) {
        next(err);
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
    try {
        // Revoke Firebase refresh tokens so the user must re-authenticate
        await auth.revokeRefreshTokens(req.user.uid);
        return successResponse(res, 200, "Logged out successfully");
    } catch (err) {
        next(err);
    }
};

// ── Get Current User ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
    try {
        const user = await firestoreService.getDocument("users", req.user.uid);
        if (!user) return errorResponse(res, 404, "User not found");
        return successResponse(res, 200, "User fetched", user);
    } catch (err) {
        next(err);
    }
};
