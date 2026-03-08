/**
 * utils/responseHelper.js
 * Standardised JSON response helpers for consistent API responses.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 */
const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
    const payload = { success: true, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} errors
 */
const errorResponse = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
    const payload = { success: false, message };
    if (errors !== null) payload.errors = errors;
    return res.status(statusCode).json(payload);
};

/**
 * Send a paginated list response.
 */
const paginatedResponse = (res, data, total, page, limit) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
