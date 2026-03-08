/**
 * middleware/errorHandler.js
 * Global Express error handler — must be registered last in app.js.
 */

const { NODE_ENV } = require("../config/env");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode} ${message}`);

    if (NODE_ENV === "development") {
        console.error(err.stack);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
