/**
 * middleware/authenticate.js
 * Verifies the Bearer JWT sent by the client.
 * On success, attaches { uid, email, role } to req.user.
 */

const { verifyToken } = require("../utils/jwtHelper");
const { errorResponse } = require("../utils/responseHelper");

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return errorResponse(res, 401, "No token provided. Please log in.");
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        // Attach decoded claims to request object
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return errorResponse(res, 401, "Session expired. Please log in again.");
        }
        return errorResponse(res, 401, "Invalid token.");
    }
};

module.exports = authenticate;
