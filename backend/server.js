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
import userRoutes from "./routes/userRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import ShippingRoutes from "./routes/shippingRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

/* ================= FIX __dirname ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= CORS CONFIG ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://adisseats.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false); // ❌ never throw error
  },
  credentials: true,
};

// ✅ Apply CORS
app.use(cors(corsOptions));

// ✅ Handle preflight requests properly
app.options(/.*/, cors(corsOptions));

/* ================= EXTRA HEADERS (SAFE FIX) ================= */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://adisseats.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

/* ================= MIDDLEWARE ================= */
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
app.use("/api/shipping", ShippingRoutes);
app.use("/api", questionRoutes);
app.use("/api", contactRoutes);

/* ================= TEST ROUTE ================= */
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/* ================= SERVER + SOCKET.IO ================= */
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/* ================= ONLINE USERS TRACKING ================= */
export const onlineOwners = new Map();
export const onlineAdmins = new Map();

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("registerOwner", (ownerId) => {
    onlineOwners.set(ownerId, socket.id);
    console.log("Owner online:", ownerId);
  });

  socket.on("registerAdmin", (adminId) => {
    onlineAdmins.set(adminId, socket.id);
    console.log("Admin online:", adminId);
  });

  socket.on("disconnect", () => {
    onlineOwners.forEach((value, key) => {
      if (value === socket.id) onlineOwners.delete(key);
    });

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