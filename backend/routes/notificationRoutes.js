import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Fetch all notifications for logged-in user
router.get("/", auth, getUserNotifications);

// Mark notification as read
router.put("/:notificationId/read", auth, markNotificationRead);

export default router;