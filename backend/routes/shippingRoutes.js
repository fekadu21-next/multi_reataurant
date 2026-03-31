import express from "express";
import { getShippingSettings, updateShippingSettings } from "../controllers/shippingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current shipping & commission
router.get("/", getShippingSettings);

// Update shipping & commission (Admin only)
router.put("/", protect, updateShippingSettings);

export default router;