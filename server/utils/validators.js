/**
 * utils/validators.js
 * express-validator rule sets reused across route files.
 */

const { body, param, query } = require("express-validator");

// ─── Auth ────────────────────────────────────────────────────────────────────

const registerRules = [
    body("email").isEmail().withMessage("Valid email required"),
    body("displayName")
        .trim()
        .notEmpty()
        .withMessage("Display name is required")
        .isLength({ max: 60 })
        .withMessage("Name must be ≤ 60 characters"),
    body("role")
        .isIn(["student", "alumni"])
        .withMessage("Role must be 'student' or 'alumni'"),
    body("graduationYear")
        .optional()
        .isInt({ min: 1980, max: new Date().getFullYear() + 6 })
        .withMessage("Invalid graduation year"),
    body("department").optional().trim().isLength({ max: 100 }),
];

// ─── Jobs ─────────────────────────────────────────────────────────────────────

const jobRules = [
    body("title").trim().notEmpty().withMessage("Job title is required"),
    body("company").trim().notEmpty().withMessage("Company name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("type")
        .isIn(["full-time", "part-time", "internship", "contract"])
        .withMessage("Invalid job type"),
    body("requiredSkills").optional().isArray(),
];

// ─── Events ───────────────────────────────────────────────────────────────────

const eventRules = [
    body("title").trim().notEmpty().withMessage("Event title is required"),
    body("description").trim().notEmpty(),
    body("date").isISO8601().withMessage("Valid ISO date required"),
    body("isVirtual").optional().isBoolean(),
];

// ─── Mentor request ───────────────────────────────────────────────────────────

const mentorRequestRules = [
    body("mentorId").notEmpty().withMessage("mentorId is required"),
    body("message").trim().isLength({ min: 10, max: 500 }).withMessage("Message must be 10–500 chars"),
    body("topics").optional().isArray(),
];

// ─── Shared ───────────────────────────────────────────────────────────────────

const uidParam = [param("uid").notEmpty().withMessage("uid param required")];
const idParam = [param("id").notEmpty().withMessage("id param required")];

const paginationQuery = [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
    registerRules,
    jobRules,
    eventRules,
    mentorRequestRules,
    uidParam,
    idParam,
    paginationQuery,
};
