import axios from "axios";

export const initializeChapa = async (req, res) => {
  try {
    const { amount, email, firstName, lastName, tx_ref } = req.body;

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref,
        callback_url: "https://localhost:3000/payment-success",
        return_url: "https://localhost:3000/payment-success",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Chapa init failed" });
  }
};
