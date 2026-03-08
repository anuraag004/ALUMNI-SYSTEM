/**
 * controllers/event.controller.js
 */
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../config/firebase");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");
const firestoreService = require("../services/firestore.service");

exports.listEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const snapshot = await db.collection("events").orderBy("date", "asc").get();
        const events = snapshot.docs.map((d) => d.data());
        const total = events.length;
        const offset = (page - 1) * limit;
        return paginatedResponse(res, events.slice(offset, offset + parseInt(limit, 10)), total, parseInt(page), parseInt(limit));
    } catch (err) { next(err); }
};

exports.getEvent = async (req, res, next) => {
    try {
        const event = await firestoreService.getDocument("events", req.params.id);
        if (!event) return errorResponse(res, 404, "Event not found");
        return successResponse(res, 200, "Event fetched", event);
    } catch (err) { next(err); }
};

exports.createEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return errorResponse(res, 422, "Validation failed", errors.array());

        const eventId = uuidv4();
        const event = {
            id: eventId,
            title: req.body.title,
            description: req.body.description,
            organizer: req.user.uid,
            date: new Date(req.body.date),
            venue: req.body.venue || "",
            isVirtual: req.body.isVirtual || false,
            meetingLink: req.body.meetingLink || "",
            maxAttendees: req.body.maxAttendees || null,
            registrations: [],
            createdAt: new Date(),
        };

        await firestoreService.setDocument("events", eventId, event);
        return successResponse(res, 201, "Event created", event);
    } catch (err) { next(err); }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const event = await firestoreService.getDocument("events", req.params.id);
        if (!event) return errorResponse(res, 404, "Event not found");
        if (event.organizer !== req.user.uid && req.user.role !== "admin") {
            return errorResponse(res, 403, "Not authorised");
        }
        const { id: _id, organizer: _o, createdAt: _ca, registrations: _r, ...updates } = req.body;
        await firestoreService.updateDocument("events", req.params.id, updates);
        return successResponse(res, 200, "Event updated");
    } catch (err) { next(err); }
};

exports.registerForEvent = async (req, res, next) => {
    try {
        const event = await firestoreService.getDocument("events", req.params.id);
        if (!event) return errorResponse(res, 404, "Event not found");
        if (event.registrations.includes(req.user.uid)) {
            return errorResponse(res, 409, "Already registered for this event");
        }
        if (event.maxAttendees && event.registrations.length >= event.maxAttendees) {
            return errorResponse(res, 400, "Event is fully booked");
        }
        await db.collection("events").doc(req.params.id).update({
            registrations: [...event.registrations, req.user.uid],
        });
        return successResponse(res, 200, "Registered for event successfully");
    } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await firestoreService.getDocument("events", req.params.id);
        if (!event) return errorResponse(res, 404, "Event not found");
        await firestoreService.deleteDocument("events", req.params.id);
        return successResponse(res, 200, "Event deleted");
    } catch (err) { next(err); }
};
