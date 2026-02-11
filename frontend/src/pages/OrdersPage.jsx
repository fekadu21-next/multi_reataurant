import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function OrdersPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/sinorders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-10 font-sans">{error}</div>
    );
  }

  if (!order) {
    return <div className="text-center mt-10 font-sans">Order not found</div>;
  }

  // Formatting Date
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate subtotal from items
  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = order.totalPrice - subtotal;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 font-sans text-[#333]">
      {/* TITLE SECTION */}
      <h1 className="text-[42px] font-normal text-center mb-10 text-[#444]">
        Order received
      </h1>

      <p className="text-[15px] mb-8">
        Thank you. Your order has been received.
      </p>

      {/* SUMMARY LIST */}
      <ul className="space-y-3 mb-12 text-[15px]">
        <li className="flex items-center gap-2">
          <span className="text-gray-600">• Order number:</span>
          <span className="font-bold">{order._id.slice(-5).toUpperCase()}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gray-600">• Date:</span>
          <span className="font-bold">{orderDate}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gray-600">• Total:</span>
          <span className="font-bold">
            Br{" "}
            {order.totalPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gray-600">• Payment method:</span>
          <span className="font-bold">
            {order.paymentMethod === "BANK"
              ? "Bank Transfer Or TeleBirr"
              : order.paymentMethod}
          </span>
        </li>
      </ul>

      <p className="text-[15px] mb-6">Make Payment via below account</p>

      {/* BANK DETAILS SECTION */}
      <section className="mb-12">
        <h2 className="text-[28px] font-semibold mb-6 pb-1 relative inline-block">
          Our bank details
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
        </h2>

        <div className="space-y-8 mt-4">
          <div>
            <h3 className="text-[24px] font-semibold mb-4 pb-1 relative inline-block">
              Maraki Eats food ordering system:
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
            </h3>
            <p className="text-[14px] mt-2">
              Bank:{" "}
              <span className="font-bold">
                Commercial Bank of Ethiopia of Ethiopia
              </span>
            </p>
            <p className="text-[14px]">
              Account number: <span className="font-bold">1000654436097</span>
            </p>
          </div>

          <div>
            <h3 className="text-[24px] font-semibold mb-4 pb-1 relative inline-block">
              Fekadu Asafewe:
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
            </h3>
            <p className="text-[14px] mt-2">
              Bank: <span className="font-bold">TeleBirr</span>
            </p>
            <p className="text-[14px]">
              Account number: <span className="font-bold">0977-91-90-00</span>
            </p>
          </div>
        </div>
      </section>

      {/* ORDER DETAILS TABLE */}
      <section className="mb-12">
        <h2 className="text-[28px] font-semibold mb-8 pb-1 relative inline-block">
          Order details
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
        </h2>

        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 font-bold">Product</th>
              <th className="text-left py-4 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-4 text-gray-600">
                  {item.name}{" "}
                  <span className="font-bold text-black ml-1">
                    × {item.quantity}
                  </span>
                </td>
                <td className="py-4 font-medium">
                  Br{" "}
                  {(item.price * item.quantity).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            <tr className="border-b">
              <td className="py-4 font-bold">Subtotal:</td>
              <td className="py-4">
                Br{" "}
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-bold">Shipping:</td>
              <td className="py-4 text-gray-600">
                Br{" "}
                {shippingCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                via Express Delivery in Addis Ababa
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-bold">Payment method:</td>
              <td className="py-4 text-gray-600">Bank Transfer Or TeleBirr</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 font-bold">Total:</td>
              <td className="py-4 font-bold">
                Br{" "}
                {order.totalPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr>
              <td className="py-4 font-bold">Note:</td>
              <td className="py-4 text-gray-600 italic">
                {order.instructions || "No notes provided"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ADDRESS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
        <div>
          <h2 className="text-[24px] font-semibold mb-6 pb-1 relative inline-block">
            Billing address
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
          </h2>
          <div className="text-[15px] leading-relaxed text-gray-600">
            <p className="capitalize">
              {order.customerName.firstName} {order.customerName.lastName}
            </p>
            <p className="capitalize">{order.deliveryAddress.street}</p>
            <p className="capitalize">{order.deliveryAddress.city}</p>
            <p>{order.customerPhone}</p>
            <p className="mt-4">{order.customerEmail}</p>
          </div>
        </div>

        <div>
          <h2 className="text-[24px] font-semibold mb-6 pb-1 relative inline-block">
            Shipping address
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ffde00]"></div>
          </h2>
          <div className="text-[15px] leading-relaxed text-gray-600">
            <p className="capitalize">
              {order.customerName.firstName} {order.customerName.lastName}
            </p>
            <p className="capitalize">{order.deliveryAddress.street}</p>
            <p className="capitalize">{order.deliveryAddress.city}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
