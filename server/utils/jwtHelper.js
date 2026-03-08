/**
 * utils/jwtHelper.js
 * Thin wrappers around jsonwebtoken for signing and verifying JWTs.
 */

const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

/**
 * Sign a JWT containing the given payload.
 * @param {object} payload  - Data to embed (uid, email, role)
 * @returns {string}        - Signed JWT string
 */
const signToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };
