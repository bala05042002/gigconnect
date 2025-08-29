import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, markAsRead, getUnreadCount } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.get("/unread", protect, getUnreadCount);

export default router;
