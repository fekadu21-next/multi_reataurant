import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
// ================= INITIATE CHAPA PAYMENT =================
import axios from "axios";

export const confirmPayment = async (req, res) => {
  const { transactionRef } = req.body;

  try {
    // 1️⃣ Find the payment record
    const payment = await Payment.findOne({ transactionRef });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
    // 2️⃣ Verify payment with Chapa
    const verify = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${transactionRef}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    if (verify.data.status !== "success") {
      payment.status = "FAILED";
      await payment.save();
      return res.status(400).json({ message: "Payment not successful" });
    }

    const orderData = payment.orderData;

    // 3️⃣ Fill all required fields like createOrder
    const commissionPercent = 15;
    const adminCommission = (orderData.totalPrice * commissionPercent) / 100;
    const restaurantAmount = orderData.totalPrice - adminCommission;

    const order = await Order.create({
      customerId: null, // guest user
      customerPhone: orderData.customer.phone,
      customerEmail: orderData.customer.email,
      customerName: {
        firstName: orderData.customer.firstName,
        lastName: orderData.customer.lastName,
      },
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      paymentMethod: "CHAPA",
      paymentStatus: "PAID",
      paymentReference: transactionRef,
      orderStatus: "PENDING",
      isSeen: false,
      adminSeen: false,
      commissionPercent,
      adminCommission,
      restaurantAmount,
      deliveryAddress: orderData.deliveryAddress,
      instructions: orderData.instructions || "",
    });

    // 4️⃣ Update payment status
    payment.status = "SUCCESS";
    await payment.save();

    return res.json({ orderId: order._id });
  } catch (err) {
    console.error("Payment confirmation error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: err.response?.data || err.message,
    });
  }
};
