// routes/chatRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  accessChat,
  sendMessage,
  getMessages,
  getUserChats
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, accessChat); // Start or get chat
router.get("/", protect, getUserChats); // Get all chats of logged-in user
router.post("/:chatId/message", protect, sendMessage); // Send message
router.get("/:chatId/messages", protect, getMessages); // Get all messages

export default router;
