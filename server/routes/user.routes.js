/**
 * routes/user.routes.js
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { uidParam } = require("../utils/validators");
const userController = require("../controllers/user.controller");

router.get("/:uid", authenticate, uidParam, userController.getUser);
router.put("/:uid", authenticate, uidParam, userController.updateUser);
router.delete("/:uid", authenticate, authorize("admin"), uidParam, userController.deleteUser);

module.exports = router;
