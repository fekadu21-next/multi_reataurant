import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chapaRoutes from "./routes/chapaRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

/* ================= FIX __dirname ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= DB ================= */
connectDB();

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chapa", chapaRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/* ================= SERVER + SOCKET.IO ================= */
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", credentials: true },
});
app.set("io", io);
/* ================= ONLINE USERS TRACKING ================= */
// Owners online
export const onlineOwners = new Map();
// Admins online
export const onlineAdmins = new Map();

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // -------------------- OWNER --------------------
  socket.on("registerOwner", (ownerId) => {
    onlineOwners.set(ownerId, socket.id);
    console.log("Owner online:", ownerId);
  });

  // -------------------- ADMIN --------------------
  socket.on("registerAdmin", (adminId) => {
    onlineAdmins.set(adminId, socket.id);
    console.log("Admin online:", adminId);
  });

  // -------------------- DISCONNECT --------------------
  socket.on("disconnect", () => {
    // Remove from owners
    onlineOwners.forEach((value, key) => {
      if (value === socket.id) onlineOwners.delete(key);
    });

    // Remove from admins
    onlineAdmins.forEach((value, key) => {
      if (value === socket.id) onlineAdmins.delete(key);
    });

    console.log("Socket disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
httpServer.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
