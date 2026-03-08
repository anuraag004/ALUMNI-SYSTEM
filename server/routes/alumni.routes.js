/**
 * routes/alumni.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const { paginationQuery } = require("../utils/validators");
const alumniController = require("../controllers/alumni.controller");

// List alumni with optional filters: department, graduationYear, skills, search
router.get("/", authenticate, paginationQuery, alumniController.listAlumni);
// Get single alumni public profile
router.get("/:uid", authenticate, alumniController.getAlumniProfile);

module.exports = router;
