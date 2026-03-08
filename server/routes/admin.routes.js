/**
 * routes/admin.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { uidParam, paginationQuery } = require("../utils/validators");
const adminController = require("../controllers/admin.controller");

// All admin routes require authentication AND admin role
router.use(authenticate, authorize("admin"));

router.get("/stats", adminController.getStats);
router.get("/users", paginationQuery, adminController.listUsers);
router.put("/users/:uid/verify", uidParam, adminController.verifyUser);
router.put("/users/:uid/role", uidParam, adminController.changeUserRole);
router.delete("/users/:uid", uidParam, adminController.deleteUser);

module.exports = router;
