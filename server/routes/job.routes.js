/**
 * routes/job.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { jobRules, idParam, paginationQuery } = require("../utils/validators");
const jobController = require("../controllers/job.controller");

router.get("/", authenticate, paginationQuery, jobController.listJobs);
router.get("/:id", authenticate, idParam, jobController.getJob);
router.post("/", authenticate, authorize("alumni", "admin"), jobRules, jobController.createJob);
router.put("/:id", authenticate, authorize("alumni", "admin"), idParam, jobController.updateJob);
router.delete("/:id", authenticate, authorize("alumni", "admin"), idParam, jobController.deleteJob);

module.exports = router;
