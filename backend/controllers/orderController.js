import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import { onlineOwners, onlineAdmins } from "../Server.js";
import { createReviewNotification } from "./notificationController.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import bcrypt from "bcryptjs";
import Shipping from "../models/Shipping.js";
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
    console.log("REQ.USER:", req.user);
    const {
      restaurantId,
      items,
      totalPrice,
      paymentMethod,
      deliveryAddress,
      instructions,
      email,
      customerName,
      createAccount,
      password,
      phone,
      shippingType, // frontend must send selected shipping type
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    let customerId = null;
    let finalEmail;
    let finalCustomerName;
    let customerPhone = "Not Provided";

    // =====================================================
    // 🔐 IF USER IS LOGGED IN
    // =====================================================
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      customerId = user._id;
      finalEmail = user.email;

      const nameParts = user.fullname.split(" ");
      finalCustomerName = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || "",
      };

      customerPhone = user.address?.phone || "Not Provided";
    }

    // =====================================================
    // 👤 IF GUEST USER
    // =====================================================
    else {
      if (!email || !customerName?.firstName || !customerName?.lastName) {
        return res.status(400).json({
          message: "Email, first name, and last name are required",
        });
      }

      const otpRecord = otpStore.get(email);

      if (!otpRecord)
        return res.status(400).json({ message: "OTP not found" });
      if (!otpRecord.verified)
        return res.status(400).json({ message: "OTP not verified" });
      if (Date.now() > otpRecord.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
      }

      finalEmail = email;
      finalCustomerName = customerName;
      customerPhone = otpRecord.phone || phone || "Not Provided";

      // ============================================
      // 🆕 CREATE USER IF REQUESTED
      // ============================================
      if (createAccount) {
        if (!password)
          return res.status(400).json({ message: "Password is required" });

        let existingUser = await User.findOne({ email });
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await User.create({
            fullname: `${customerName.firstName} ${customerName.lastName}`,
            email,
            password: hashedPassword,
            address: {
              street: deliveryAddress?.street || "",
              city: deliveryAddress?.city || "",
              phone: customerPhone,
            },
          });
          customerId = newUser._id;
        } else {
          customerId = existingUser._id;
        }
      }

      otpStore.delete(email);
    }

    // =====================================================
    // ✅ FETCH SHIPPING OPTIONS AND COMMISSION
    // =====================================================
    const shippingData = await Shipping.findOne();
    if (!shippingData) {
      return res.status(500).json({ message: "Shipping settings not found" });
    }

    const { shippingOptions, commissionPercent } = shippingData;

    const selectedShipping = shippingOptions.find(
      (opt) => opt.type === shippingType
    );
    if (!selectedShipping)
      return res.status(400).json({ message: "Invalid shipping option" });

    // =====================================================
    // 💰 Calculate admin commission and restaurant amount
    // =====================================================
    const adminCommission = (totalPrice * commissionPercent) / 100;
    const restaurantAmount = totalPrice - adminCommission;

    // =====================================================
    // 🧾 CREATE ORDER
    // =====================================================
    const order = await Order.create({
      customerId,
      customerPhone,
      customerEmail: finalEmail,
      customerName: finalCustomerName,

      restaurantId,
      items,
      totalPrice,

      paymentMethod,
      paymentStatus: "PENDING",
      paymentReference: "",

      orderStatus: "PENDING",
      isSeen: false,
      adminSeen: false,

      adminCommission,
      restaurantAmount,

      deliveryAddress,
      instructions,

      shippingOptions,   // snapshot of all shipping options
      selectedShipping,  // option selected by customer
    });

    // =====================================================
    // 🔔 REALTIME NOTIFICATION
    // =====================================================
    const io = req.app.get("io");
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant?.ownerId) {
      const ownerSocketId = onlineOwners.get(restaurant.ownerId.toString());
      if (ownerSocketId) {
        io.to(ownerSocketId).emit("newOrder", {
          orderId: order._id,
          restaurantId,
          message: "New order received",
        });
      }
    }

    return res.status(201).json({
      message: "Order created successfully",
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
      adminSeen: false
    });

    res.json({ unseenCount: count });

  } catch (error) {
    console.error("Get admin unseen count error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
// ------------------ Mark admin notifications as seen ------------------
export const markAdminSeen = async (req, res) => {
  try {

    await Order.updateMany(
      { adminSeen: false },
      { adminSeen: true }
    );

    res.json({
      message: "Admin notifications cleared"
    });

  } catch (error) {

    console.error("Mark admin seen error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

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

      // ✅ Populate customer
      .populate("customerId", "fullname email")

      // ✅ Populate restaurant
      .populate("restaurantId", "name")

      // ✅ 🔥 IMPORTANT: Populate items → menuItem → category
      .populate({
        path: "items.menuItemId",
        select: "name price categoryId", // menu item fields
        populate: {
          path: "categoryId",
          select: "name" // category name only
        }
      });

    res.json(orders);

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
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

    const { orderStatus, paymentStatus } = req.body;

    // 1️⃣ Validate request
    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        message: "No fields to update",
      });
    }

    // 2️⃣ Find the order
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 3️⃣ Prepare update object
    const updates = {};

    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    // 4️⃣ Update order status in database
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: false
      }
    );

    // 5️⃣ If order delivered → ask customer for review
    if (updatedOrder.orderStatus === "DELIVERED") {
      await createReviewNotification(updatedOrder);
    }

    // 6️⃣ Send response
    res.json({
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {

    console.error("Update order error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};

export const getOrdersByRestaurant = async (req, res) => {
  try {
    const orders = await Order.find({
      restaurantId: req.params.restaurantId,
    })
      .populate({
        path: "items.menuItemId",
        select: "name categoryId", // only needed fields
        populate: {
          path: "categoryId",
          select: "name", // get category name
        },
      })
      .sort({ createdAt: -1 }); // newest first

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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
