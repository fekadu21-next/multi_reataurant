import axios from "axios";
import Payment from "../models/Payment.js";

export const initiatePayment = async (req, res) => {
  try {
    const { restaurantId, items, totalPrice, deliveryAddress, customer, tx_ref } = req.body;

    // 1️⃣ Save payment BEFORE user pays
    const payment = await Payment.create({
      customer,
      amount: totalPrice,
      method: "CHAPA",
      transactionRef: tx_ref,
      status: "PENDING",
      orderData: {
        restaurantId,
        items,
        totalPrice,
        deliveryAddress,
        customer,
      },
    });

    // 2️⃣ Call Chapa initialize API
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: totalPrice,
        currency: "ETB",
        email: customer.email,
        first_name: customer.firstName,
        last_name: customer.lastName,
        tx_ref,
        return_url: `http://localhost:5173/payment-success?tx_ref=${tx_ref}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    // 3️⃣ Send checkout url to frontend
    res.json({
      checkout_url: response.data.data.checkout_url,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Chapa payment initiation failed" });
  }
};