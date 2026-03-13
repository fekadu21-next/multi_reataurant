// routes/userRoutes.js
import express from "express";
import {
  getOrders,
  reorder,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAccountInfo,
  updateAccountInfo,
  changePassword,
  updateProfileImage, // ✅ Import profile image controller
  upload, // ✅ Multer upload middleware
} from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// ===== My Orders =====
router.get("/myorders", auth, getOrders);
router.post("/orders/reorder/:orderId", auth, reorder); // One-click reorder

// ===== Favorites =====
router.get("/favorites", auth, getFavorites);
router.post("/favorites", auth, addFavorite);
router.delete("/favorites", auth, removeFavorite);

// ===== Account Settings =====
router.get("/settings", auth, getAccountInfo);
router.put("/settings", auth, updateAccountInfo);
router.put("/settings/password", auth, changePassword);

// ===== Profile Image Upload =====
router.put(
  "/settings/profile-image",
  auth,
  upload.single("profileImage"), // multer middleware
  updateProfileImage
);

export default router;