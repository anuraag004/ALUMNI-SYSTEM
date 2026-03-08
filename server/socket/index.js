/**
 * socket/index.js
 * Initialises Socket.io on the HTTP server, authenticates connections with JWT,
 * and wires up event handler modules.
 */

"use strict";

const { Server } = require("socket.io");
const { CLIENT_URL } = require("../config/env");
const { verifyToken } = require("../utils/jwtHelper");
const chatHandler = require("./chatHandler");
const notificationHandler = require("./notificationHandler");

/**
 * Bootstrap Socket.io on the given HTTP server.
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
        pingInterval: 25_000,
        pingTimeout: 60_000,
    });

    // ── JWT Authentication Middleware ────────────────────────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) return next(new Error("Authentication required"));

        try {
            const decoded = verifyToken(token);
            socket.user = decoded; // attach { uid, email, role }
            next();
        } catch {
            next(new Error("Invalid or expired token"));
        }
    });

    // ── Connection Handler ───────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        const { uid, email } = socket.user;
        console.log(`[Socket.io] Connected: ${email} (${socket.id})`);

        // Join a personal room for targeted notifications
        socket.join(`user:${uid}`);

        // Register chat event handlers
        chatHandler(io, socket);

        // Register notification event handlers
        notificationHandler(io, socket);

        socket.on("disconnect", (reason) => {
            console.log(`[Socket.io] Disconnected: ${email} — ${reason}`);
        });
    });

    return io;
};

module.exports = initSocket;
