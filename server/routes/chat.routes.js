/**
 * routes/chat.routes.js
 * REST endpoints for conversation history; actual messaging via Socket.io.
 */
const router = require("express").Router();
const authenticate = require("../middleware/authenticate");
const { idParam, paginationQuery } = require("../utils/validators");
const chatController = require("../controllers/chat.controller");

router.get("/conversations", authenticate, chatController.listConversations);
router.post("/conversations", authenticate, chatController.createConversation);
router.get("/conversations/:id/messages", authenticate, idParam, paginationQuery, chatController.getMessages);

module.exports = router;
