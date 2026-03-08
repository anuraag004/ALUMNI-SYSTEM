/**
 * server.js
 * HTTP + Socket.io server bootstrap.
 * Requires the Express app from app.js and attaches Socket.io.
 */

"use strict";

const http = require("http");
const app = require("./app");
const { PORT } = require("./config/env");
const initSocket = require("./socket");

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
initSocket(server);

// Start listening
server.listen(PORT, () => {
    console.log(`\n🚀  Alumni Platform server running on port ${PORT}`);
    console.log(`📡  REST API:    http://localhost:${PORT}/api/v1`);
    console.log(`🔌  Socket.io:  ws://localhost:${PORT}\n`);
});

// Graceful shutdown for production (e.g. PM2, Docker SIGTERM)
const shutdown = (signal) => {
    console.log(`\n[${signal}] Gracefully shutting down...`);
    server.close(() => {
        console.log("✅  HTTP server closed.");
        process.exit(0);
    });
    // Force exit after 10 s
    setTimeout(() => process.exit(1), 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Unhandled rejections — log and exit so PM2/k8s can restart
process.on("unhandledRejection", (reason) => {
    console.error("[Unhandled Rejection]", reason);
    process.exit(1);
});

module.exports = server; // exported for supertest integration tests
