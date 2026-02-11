import express from "express";
import {
  register,
  login,
  logout,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  saveBillingInfo,
  sendOtp,
  verifyOtp,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* AUTH */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

/* USERS */
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

/* CHECKOUT FLOW */
router.post("/billing", protect, saveBillingInfo);
router.post("/send-otp", protect, sendOtp);
router.post("/verify-otp", protect, verifyOtp);

export default router;
