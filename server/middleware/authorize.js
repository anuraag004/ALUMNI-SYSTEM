const { errorResponse } = require("../utils/responseHelper");

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
