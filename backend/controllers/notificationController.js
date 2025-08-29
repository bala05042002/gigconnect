import Notification from "../models/notificationModel.js";
import asyncHandler from "express-async-handler";

// Helper function to create and send a notification
export const createNotification = async (req, user, message, link) => {
    const newNotification = new Notification({
        user: user,
        message,
        link,
    });
    const savedNotification = await newNotification.save();

    // Emit notification to the user's specific room
    const io = req.app.get('io');
    io.to(user.toString()).emit('newNotification', savedNotification);
};

// @desc Get notifications for logged-in user
// @route GET /api/notifications
// @access Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
// @access Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc  Get unread notifications count
// @route  GET /api/notifications/unread
// @access Private
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        user: req.user._id,
        read: false,
    });

    res.json({ count });
});