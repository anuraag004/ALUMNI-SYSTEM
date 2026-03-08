/**
 * routes/auth.routes.js
 */
const router = require("express").Router();
const { authLimiter } = require("../middleware/rateLimit");
const authenticate = require("../middleware/authenticate");
const { registerRules } = require("../utils/validators");
const authController = require("../controllers/auth.controller");

router.post("/register", authLimiter, registerRules, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
