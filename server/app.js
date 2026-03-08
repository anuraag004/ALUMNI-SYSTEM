/**
 * app.js
 * Express application factory — registers middleware, routes, and error handler.
 */

"use strict";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { CLIENT_URL, NODE_ENV } = require("./config/env");

// ── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const alumniRoutes = require("./routes/alumni.routes");
const jobRoutes = require("./routes/job.routes");
const eventRoutes = require("./routes/event.routes");
const mentorRoutes = require("./routes/mentor.routes");
const resumeRoutes = require("./routes/resume.routes");
const chatRoutes = require("./routes/chat.routes");
const adminRoutes = require("./routes/admin.routes");

// ── Middleware Imports ────────────────────────────────────────────────────────
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimit");

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── HTTP Logging ──────────────────────────────────────────────────────────────
if (NODE_ENV !== "test") {
    app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use("/api", apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Alumni Platform API is running 🚀", time: new Date() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = "/api/v1";
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/alumni`, alumniRoutes);
app.use(`${API}/jobs`, jobRoutes);
app.use(`${API}/events`, eventRoutes);
app.use(`${API}/mentor`, mentorRoutes);
app.use(`${API}/resume`, resumeRoutes);
app.use(`${API}/chat`, chatRoutes);
app.use(`${API}/admin`, adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
