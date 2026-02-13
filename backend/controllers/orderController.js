import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js"; // Adjust path if needed

import { onlineOwners, onlineAdmins } from "../Server.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
const otpStore = new Map();

// ✉️ Send OTP email
export const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp, // always string
      phone,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      verified: false,
    });

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ✅ Verify OTP email
export const verifyOtp = (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });

  otp = otp.toString().trim(); // convert to string and trim

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: "OTP not found" });

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  // ✅ ensure type and trimming match
  if (record.otp.toString().trim() !== otp)
    return res.status(400).json({ message: "Invalid OTP" });

  // ✅ OTP correct → mark verified
  record.verified = true;
  otpStore.set(email, record);

  res.json({ message: "OTP verified successfully" });
};
// 🛒 Create order (only after OTP verification)
export const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      totalPrice,
      paymentMethod,
      deliveryAddress,
      instructions,
      email,
      customerName,
    } = req.body;

    // ------------------ Required fields check ------------------
    if (!email || !customerName?.firstName || !customerName?.lastName) {
      return res.status(400).json({
        message: "Email, first name, and last name are required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    // ------------------ OTP validation ------------------
    const otpRecord = otpStore.get(email);

    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });
    if (!otpRecord.verified)
      return res.status(400).json({ message: "OTP not verified" });
    if (Date.now() > otpRecord.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    // ------------------ Customer info ------------------
    const customerId = req.user ? req.user.id : null;

    // ------------------ Commission ------------------
    const commissionPercent = 15;
    const adminCommission = (totalPrice * commissionPercent) / 100;
    const restaurantAmount = totalPrice - adminCommission;

    // ------------------ Create order ------------------
    const order = await Order.create({
      customerId,
      customerPhone: otpRecord.phone || "Not Provided",
      customerEmail: email,
      customerName,

      restaurantId,
      items,
      totalPrice,

      paymentMethod,
      paymentStatus: "PENDING", // initially pending
      paymentReference: "",

      orderStatus: "PENDING", // initially pending

      // ✅ Add unseen fields
      isSeen: false, // for owner
      adminSeen: false, // for admin

      commissionPercent,
      adminCommission,
      restaurantAmount,

      deliveryAddress,
      instructions,
    });

    // ------------------ Clear OTP ------------------
    otpStore.delete(email);

    // ------------------ Get io instance ------------------
    const io = req.app.get("io");

    // ------------------ Owner Notification ------------------
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant?.ownerId) {
      const ownerId = restaurant.ownerId.toString();

      const ownerSocketId = onlineOwners.get(ownerId);
      if (ownerSocketId) {
        io.to(ownerSocketId).emit("newOrder", {
          orderId: order._id,
          restaurantId,
          message: "New order received",
        });
      }
    }

    // ------------------ Admin Notification ------------------
    // Notify all online admins if order is PAID & CONFIRMED
    if (order.paymentStatus === "PAID" && order.orderStatus === "CONFIRMED") {
      // emit to all online admins
      onlineAdmins.forEach((socketId) => {
        io.to(socketId).emit("adminNewOrder", {
          orderId: order._id,
          restaurantId,
          message: "New PAID & CONFIRMED order",
        });
      });
    }

    // ------------------ Return response ------------------
    return res.status(201).json({
      message: "Order created successfully. Payment pending.",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const getAdminUnseenCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
      adminSeen: false,
    });

    res.json({ unseenCount: count });
  } catch (error) {
    console.error("Get admin unseen count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ Mark admin notifications as seen ------------------
export const markAdminSeen = async (req, res) => {
  try {
    await Order.updateMany(
      {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        adminSeen: false,
      },
      { adminSeen: true },
    );

    res.json({ message: "Admin notifications cleared" });
  } catch (error) {
    console.error("Mark admin seen error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("restaurantId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUnseenOrdersCount = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const count = await Order.countDocuments({
      restaurantId,
      isSeen: false,
    });

    return res.status(200).json({ unseenCount: count });
  } catch (error) {
    console.error("Get unseen orders count error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* ================= MARK ALL ORDERS AS SEEN ================= */
export const markOrdersSeen = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    await Order.updateMany(
      { restaurantId, isSeen: false },
      { $set: { isSeen: true } },
    );

    return res.status(200).json({ message: "All orders marked as seen" });
  } catch (error) {
    console.error("Mark orders seen error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Other endpoints (unchanged)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "fullname email")
      .populate("restaurantId", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id }).populate(
      "restaurantId",
      "name",
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// GET orders for current user (guest by email or logged-in by id)
export const getMyOrders = async (req, res) => {
  try {
    const { email } = req.query; // for guest users
    let orders;

    if (req.user) {
      // Logged-in user
      orders = await Order.find({ customerId: req.user.id })
        .populate("restaurantId", "name")
        .sort({ createdAt: -1 });
    } else if (email) {
      // Guest user
      orders = await Order.find({ customerEmail: email })
        .populate("restaurantId", "name")
        .sort({ createdAt: -1 });
    } else {
      return res
        .status(400)
        .json({ message: "Email required for guest users" });
    }

    res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getOrdersByGuestPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const orders = await Order.find({ customerPhone: phone }).populate(
      "restaurantId",
      "name",
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    // Allow updating either orderStatus, paymentStatus, or both
    const { orderStatus, paymentStatus } = req.body;

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Build update object dynamically
    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }, // return the updated document
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrdersByRestaurant = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurantId: req.params.restaurantId,
    }).sort({ createdAt: -1 }); // newest first

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
