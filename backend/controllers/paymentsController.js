import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

// ================= INITIATE CHAPA PAYMENT =================
export const initiatePayment = async (req, res) => {
  try {
    const { restaurantId, items, totalPrice, deliveryAddress, customer } =
      req.body;

    const transactionRef = `TX-${Date.now()}`;

    const payment = await Payment.create({
      customer,
      amount: totalPrice,
      method: "CHAPA",
      transactionRef,
      status: "PENDING",
      orderData: {
        restaurantId,
        items,
        totalPrice,
        deliveryAddress,
        customer,
      },
    });

    res.json({
      message: "Payment initiated",
      transactionRef,
      paymentId: payment._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CONFIRM PAYMENT (AFTER CHAPA SUCCESS) =================
export const confirmPayment = async (req, res) => {
  const { transactionRef, orderData } = req.body;

  try {
    // 1️⃣ Verify payment with Chapa
    const verify = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${transactionRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    if (verify.data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // 2️⃣ Create order ONLY after successful payment
    const order = await Order.create({
      ...orderData,
      paymentMethod: "CHAPA",
      paymentReference: transactionRef,
      isPaid: true,
    });

    res.json({ orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
