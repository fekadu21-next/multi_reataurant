import express from "express";
import {
  createReview,
  getReviews,
  getReviewsByRestaurant,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// CRUD routes
router.post("/", createReview); // Add a review
router.get("/", getReviews); // Get all reviews
router.get("/restaurant/:restaurantId", getReviewsByRestaurant);
router.put("/:id", updateReview); // Update a review
router.delete("/:id", deleteReview); // Delete a review

export default router;
