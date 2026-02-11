import { useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function PaymentRedirect() {
  const { state } = useLocation();

  useEffect(() => {
    if (!state) return;

    const initPayment = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/chapa/initialize",
          {
            amount: state.amount,
            email: state.email,
            firstName: state.firstName,
            lastName: state.lastName,
            tx_ref: state.tx_ref,
          },
        );

        // redirect user to Chapa
        window.location.href = res.data.data.checkout_url;
      } catch (err) {
        console.error(err);
        alert("Failed to initialize Chapa payment.");
      }
    };

    initPayment();
  }, [state]);

  return (
    <div className="h-screen flex items-center justify-center">
      Redirecting to secure Chapa payment...
    </div>
  );
}
