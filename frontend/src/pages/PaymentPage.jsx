import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // If someone opens /payment directly
  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold text-red-600">
          No payment data found
        </h2>
      </div>
    );
  }
  const { orderId, email, amount, customerName, phone } = state;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-600">
          CHAPA PAYMENT (TEST)
        </h1>

        <p className="text-gray-700">
          This is a hardcoded page to test navigation
        </p>

        <div className="text-left text-sm space-y-2">
          <p>
            <strong>Order ID:</strong> {orderId}
          </p>
          <p>
            <strong>Name:</strong> {customerName}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
          <p>
            <strong>Phone:</strong> {phone}
          </p>
          <p>
            <strong>Amount:</strong> Br {amount}
          </p>
        </div>

        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700"
        >
          Simulate Payment Success
        </button>
      </div>
    </div>
  );
}
