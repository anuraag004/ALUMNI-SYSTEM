/**
 * middleware/authorize.js
 * Role-based access control middleware factory.
 *
 * Usage:
 *   router.post('/jobs', authenticate, authorize('alumni', 'admin'), createJob);
 */

const { errorResponse } = require("../utils/responseHelper");

/**
 * @param {...string} allowedRoles - One or more roles that may access the route.
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, "Authentication required.");
        }

        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                403,
                `Access denied. Required role(s): ${allowedRoles.join(" or ")}.`
            );
        }

        next();
    };
};

module.exports = authorize;
