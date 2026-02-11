import express from "express";
import {
  createOrder,
  getOrders,
  getOrdersByCustomer,
  getOrdersByGuestPhone,
  getOrdersByRestaurant,
  updateOrderStatus,
  deleteOrder,
  sendOtp,
  verifyOtp,
  getMyOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { auth } from "../middleware/Auth.js";

const router = express.Router();

// 🔹 OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// 🛒 Create order (only after OTP verified)
router.post("/", createOrder);
router.get("/sinorders/:id", getOrderById);
// 👤 Logged-in customer orders
router.get("/my-orderss", auth, getOrdersByCustomer);
router.get("/my-orders", getMyOrders);
// 👤 Guest orders by phone
// router.get("/guest/:phone", getOrdersByGuestPhone);

// 🍽 Restaurant orders
router.get("/restaurant/:restaurantId", getOrdersByRestaurant);

// 👑 Admin
router.get("/", auth, getOrders);
router.put("/:id/status", auth, updateOrderStatus);
router.delete("/:id", auth, deleteOrder);

export default router;
