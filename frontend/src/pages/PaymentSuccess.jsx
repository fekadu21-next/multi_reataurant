import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    console.log("PaymentSuccess component mounted");

    const query = new URLSearchParams(location.search);
    const tx_ref = query.get("tx_ref");

    console.log("tx_ref from URL:", tx_ref);

    if (!tx_ref) {
      console.error("No tx_ref in URL");
      return;
    }
    const confirmPayment = async () => {
      try {
        console.log("Sending request to backend...");

        const res = await axios.post(
          "http://localhost:5000/api/payments/confirm",
          { transactionRef: tx_ref }
        );

        console.log("Backend response:", res.data);

        alert("Payment successful!");
        navigate(`/orders/${res.data.orderId}`);
      } catch (err) {
        console.error("Error verifying payment:", err.response?.data || err.message);
        alert("Payment verification failed");
      }
    };

    confirmPayment();
  }, [location.search, navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      Verifying payment...
    </div>
  );
}