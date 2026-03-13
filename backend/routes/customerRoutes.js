import express from "express";
import { getRestaurantCustomers } from "../controllers/customerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/restaurant/:restaurantId", protect, getRestaurantCustomers);

export default router;