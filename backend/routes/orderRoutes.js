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
  getUnseenOrdersCount,
  markOrdersSeen,
  getAdminUnseenCount,
  markAdminSeen,
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
router.get("/admin/unseen-count", auth, getAdminUnseenCount);

// ------------------ Mark admin notifications as seen ------------------
router.post("/admin/mark-seen", auth, markAdminSeen);
// 🍽 Restaurant orders
router.get("/restaurant/:restaurantId", getOrdersByRestaurant);
router.get(
  "/restaurant/:restaurantId/unseen-count",
  auth,
  getUnseenOrdersCount,
);

// Mark all orders as seen
router.put("/restaurant/:restaurantId/seen", auth, markOrdersSeen);

// 👑 Admin
router.get("/", auth, getOrders);
router.put("/:id/status", auth, updateOrderStatus);
router.delete("/:id", auth, deleteOrder);

export default router;
