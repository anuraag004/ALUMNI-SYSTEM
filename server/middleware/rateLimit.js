/**
 * middleware/rateLimit.js
 * express-rate-limit presets for different route groups.
 */

const rateLimit = require("express-rate-limit");

/** Strict limiter for auth endpoints — prevents brute-force */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Try again in 15 minutes." },
});

/** General API limiter */
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Rate limit exceeded. Slow down." },
});

/** AI endpoint limiter — heavier computation */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "AI request limit reached. Try again in 1 hour." },
});

module.exports = { authLimiter, apiLimiter, aiLimiter };
