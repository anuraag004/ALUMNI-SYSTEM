/**
 * routes/mentor.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { mentorRequestRules, idParam } = require("../utils/validators");
const { aiLimiter } = require("../middleware/rateLimit");
const mentorController = require("../controllers/mentor.controller");

// AI-powered recommendations (student only)
router.get("/recommendations", authenticate, authorize("student"), aiLimiter, mentorController.getRecommendations);
// Mentor request lifecycle
router.get("/requests", authenticate, authorize("alumni"), mentorController.getMentorRequests);
router.post("/request", authenticate, authorize("student"), mentorRequestRules, mentorController.sendRequest);
router.put("/request/:id", authenticate, authorize("alumni"), idParam, mentorController.respondToRequest);

module.exports = router;
