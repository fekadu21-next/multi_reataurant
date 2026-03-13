import express from "express";
import {
  getUserRecommendations,
  getGuestRecommendations
} from "../controllers/recommendationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/user-recommendations",
  protect,
  getUserRecommendations
);


router.get(
  "/guest-recommendations",
  getGuestRecommendations
);

export default router;