/**
 * controllers/alumni.controller.js
 * Alumni directory — searchable, filterable, paginated.
 */
const { db } = require("../config/firebase");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// ── List Alumni ───────────────────────────────────────────────────────────────
exports.listAlumni = async (req, res, next) => {
    try {
        const { department, graduationYear, skill, search, page = 1, limit = 12 } = req.query;

        let query = db.collection("users").where("role", "==", "alumni").where("isVerified", "==", true);

        if (department) query = query.where("department", "==", department);
        if (graduationYear) query = query.where("graduationYear", "==", parseInt(graduationYear, 10));
        if (skill) query = query.where("skills", "array-contains", skill);

        const snapshot = await query.get();
        let alumni = snapshot.docs.map((d) => d.data());

        // Client-side text search (Firestore doesn't support full-text natively)
        if (search) {
            const term = search.toLowerCase();
            alumni = alumni.filter(
                (u) =>
                    u.displayName?.toLowerCase().includes(term) ||
                    u.currentCompany?.toLowerCase().includes(term) ||
                    u.currentRole?.toLowerCase().includes(term) ||
                    u.bio?.toLowerCase().includes(term)
            );
        }

        // Paginate
        const total = alumni.length;
        const offset = (page - 1) * limit;
        const paginated = alumni.slice(offset, offset + parseInt(limit, 10));

        return paginatedResponse(res, paginated, total, parseInt(page, 10), parseInt(limit, 10));
    } catch (err) {
        next(err);
    }
};

// ── Get Single Alumni Profile ─────────────────────────────────────────────────
exports.getAlumniProfile = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const doc = await db.collection("users").doc(uid).get();
        if (!doc.exists || doc.data().role !== "alumni") {
            return errorResponse(res, 404, "Alumni not found");
        }
        return successResponse(res, 200, "Alumni profile fetched", doc.data());
    } catch (err) {
        next(err);
    }
};
