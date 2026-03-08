/**
 * routes/event.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { eventRules, idParam, paginationQuery } = require("../utils/validators");
const eventController = require("../controllers/event.controller");

router.get("/", authenticate, paginationQuery, eventController.listEvents);
router.get("/:id", authenticate, idParam, eventController.getEvent);
router.post("/", authenticate, authorize("alumni", "admin"), eventRules, eventController.createEvent);
router.put("/:id", authenticate, authorize("alumni", "admin"), idParam, eventController.updateEvent);
router.post("/:id/register", authenticate, idParam, eventController.registerForEvent);
router.delete("/:id", authenticate, authorize("admin"), idParam, eventController.deleteEvent);

module.exports = router;
