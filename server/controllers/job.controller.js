const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

exports.listJobs = async (req, res, next) => {
    try {
        const { type, skill, page = 1, limit = 10 } = req.query;

        let query = db.collection("jobs").where("isActive", "==", true).orderBy("createdAt", "desc");
        if (type) query = query.where("type", "==", type);
        if (skill) query = query.where("requiredSkills", "array-contains", skill);

        const snapshot = await query.get();
        const jobs = snapshot.docs.map((d) => d.data());

        const total = jobs.length;
        const offset = (page - 1) * limit;
        return paginatedResponse(res, jobs.slice(offset, offset + parseInt(limit, 10)), total, parseInt(page, 10), parseInt(limit, 10));
    } catch (err) {
        next(err);
    }
};

exports.getJob = async (req, res, next) => {
    try {
        const job = await firestoreService.getDocument("jobs", req.params.id);
        if (!job) return errorResponse(res, 404, "Job not found");
        return successResponse(res, 200, "Job fetched", job);
    } catch (err) {
        next(err);
    }
};

exports.createJob = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 422, "Validation failed", errors.array());

        const jobId = uuidv4();
        const job = {
            id: jobId,
            postedBy: req.user.uid,
            title: req.body.title,
            company: req.body.company,
            description: req.body.description,
            requiredSkills: req.body.requiredSkills || [],
            location: req.body.location || "Remote",
            type: req.body.type,
            applicationLink: req.body.applicationLink || "",
            deadline: req.body.deadline ? new Date(req.body.deadline) : null,
            isActive: true,
            createdAt: new Date(),
        };

        await firestoreService.setDocument("jobs", jobId, job);
        return successResponse(res, 201, "Job posted successfully", job);
    } catch (err) {
        next(err);
    }
};

exports.updateJob = async (req, res, next) => {
    try {
        const job = await firestoreService.getDocument("jobs", req.params.id);
        if (!job) return errorResponse(res, 404, "Job not found");
        if (job.postedBy !== req.user.uid && req.user.role !== "admin") {
            return errorResponse(res, 403, "Not authorised to update this job");
        }
        const { id: _id, postedBy: _pb, createdAt: _ca, ...updates } = req.body;
        await firestoreService.updateDocument("jobs", req.params.id, updates);
        return successResponse(res, 200, "Job updated");
    } catch (err) {
        next(err);
    }
};

exports.deleteJob = async (req, res, next) => {
    try {
        const job = await firestoreService.getDocument("jobs", req.params.id);
        if (!job) return errorResponse(res, 404, "Job not found");
        if (job.postedBy !== req.user.uid && req.user.role !== "admin") {
            return errorResponse(res, 403, "Not authorised to delete this job");
        }
        await firestoreService.deleteDocument("jobs", req.params.id);
        return successResponse(res, 200, "Job deleted");
    } catch (err) {
        next(err);
    }
};
