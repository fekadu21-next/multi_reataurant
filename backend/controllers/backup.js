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
    // if (order.paymentStatus === "PAID" && order.orderStatus === "CONFIRMED") {
    //   // emit to all online admins
    //   onlineAdmins.forEach((socketId) => {
    //     io.to(socketId).emit("adminNewOrder", {
    //       orderId: order._id,
    //       restaurantId,
    //       message: "New PAID & CONFIRMED order",
    //     });
    //   });
    // }

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