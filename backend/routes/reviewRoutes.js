import express from "express";
import {
  createReview,
  getRestaurantReviews,
  checkReviewStatus,
  getAllReviews,     // ✅ new
  deleteReview
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// create review
router.post("/create/:orderId", protect, createReview);

// get restaurant reviews
router.get("/restaurant/:restaurantId", getRestaurantReviews);

// check if order reviewed
router.get("/check/:orderId", protect, checkReviewStatus);
router.get("/admin/all", protect, getAllReviews);

// Delete a review by ID (admin)
router.delete("/admin/:reviewId", protect, deleteReview);

export default router;