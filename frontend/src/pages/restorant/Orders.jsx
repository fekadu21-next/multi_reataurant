import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000";

export default function Orders({ onSeen }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [recentFilter, setRecentFilter] = useState("NEWEST");
  const [unseenCount, setUnseenCount] = useState(0);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantId = storedUser?.restaurant?.restaurantId;
  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!restaurantId) return;

    const init = async () => {
      await fetchOrders();
      const timer = setTimeout(async () => {
        await markOrdersSeen();

        if (onSeen) onSeen();
      }, 3000);
      return () => clearTimeout(timer);
    };

    init();

    const socket = io(API_URL, { auth: { token } });

    socket.on("newOrder", (data) => {
      if (data.restaurantId === restaurantId) {
        fetchOrders();
      }
    });

    return () => socket.disconnect();
  }, [restaurantId]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(
        `${API_URL}/api/orders/restaurant/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setOrders(sorted);
      setFilteredOrders(sorted);

      // Fetch unseen count from DB
      const unseenRes = await axios.get(
        `${API_URL}/api/orders/restaurant/${restaurantId}/unseen-count`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUnseenCount(unseenRes.data.unseenCount);
    } catch (err) {
      console.error("Fetch orders failed:", err);
    }
  };

  /* ================= MARK ORDERS SEEN ================= */
  const markOrdersSeen = async () => {
    if (!restaurantId) return;
    try {
      await axios.put(
        `${API_URL}/api/orders/restaurant/${restaurantId}/seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // reset badge
      setUnseenCount(0);

      // refetch orders to update table
      fetchOrders();
    } catch (err) {
      console.error("Mark orders seen failed:", err);
    }
  };

  /* ================= FILTER ================= */
  const applyFilters = (payment, recent) => {
    let result = [...orders];

    if (payment !== "ALL") {
      result = result.filter((o) => o.paymentStatus === payment);
    }

    result.sort((a, b) =>
      recent === "NEWEST"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt),
    );

    setFilteredOrders(result);
  };

  const handlePaymentFilter = (status) => {
    setPaymentFilter(status);
    applyFilters(status, recentFilter);
  };

  const handleRecentFilter = (recent) => {
    setRecentFilter(recent);
    applyFilters(paymentFilter, recent);
  };

  /* ================= UPDATE ================= */
  const updateOrder = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ...updates } : o)),
      );

      applyFilters(paymentFilter, recentFilter);
    } catch {
      alert("Update failed");
    }
  };

  /* ================= DELETE ================= */
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete order?")) return;

    try {
      await axios.delete(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) => prev.filter((o) => o._id !== id));
      setFilteredOrders((prev) => prev.filter((o) => o._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= UTIL ================= */
  const totalRevenue = filteredOrders.reduce(
    (acc, o) => acc + (o.totalPrice || 0),
    0,
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  /* ================= RENDER ================= */
  return (
    <div className="p-3 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">Restaurant Orders</h2>

      <div className="flex justify-between items-center mb-4">
        <div className="text-center font-semibold text-lg">
          Revenue:{" "}
          <span className="text-green-600">{totalRevenue.toFixed(2)} ETB</span>
        </div>
        {unseenCount > 0 && (
          <div
            className="bg-blue-600 text-white px-3 py-1 rounded-full cursor-pointer"
            onClick={markOrdersSeen}
          >
            New Orders: {unseenCount}
          </div>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <select
          value={paymentFilter}
          onChange={(e) => handlePaymentFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          value={recentFilter}
          onChange={(e) => handleRecentFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
        </select>
      </div>

      {/* ORDERS TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            {[
              "Customer",
              "Email",
              "Phone",
              "Address",
              "Items",
              "Price",
              "Payment",
              "Pay Status",
              "Order Status",
              "Date",
              "Action",
            ].map((h) => (
              <th key={h} className="p-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((o) => {
            const name = o.customerName
              ? `${o.customerName.firstName} ${o.customerName.lastName}`
              : "Guest";
            const items = o.items
              .map((i) => `${i.name}×${i.quantity}`)
              .join(", ");

            return (
              <tr
                key={o._id}
                className={o.isSeen === false ? "bg-blue-100" : ""}
              >
                <td className="border p-2">{name}</td>
                <td className="border p-2">{o.customerEmail}</td>
                <td className="border p-2">{o.customerPhone}</td>
                <td className="border p-2">
                  {o.deliveryAddress?.street || "-"}
                </td>
                <td className="border p-2">{items}</td>
                <td className="border p-2">
                  {Number(o.totalPrice).toFixed(2)}
                </td>
                <td className="border p-2">{o.paymentMethod}</td>

                <td className="border p-2">
                  <select
                    value={o.paymentStatus}
                    onChange={(e) =>
                      updateOrder(o._id, { paymentStatus: e.target.value })
                    }
                  >
                    <option>PENDING</option>
                    <option>PAID</option>
                    <option>FAILED</option>
                  </select>
                </td>

                <td className="border p-2">
                  <select
                    value={o.orderStatus}
                    onChange={(e) =>
                      updateOrder(o._id, { orderStatus: e.target.value })
                    }
                  >
                    <option>PENDING</option>
                    <option>CONFIRMED</option>
                    <option>PREPARING</option>
                    <option>DELIVERED</option>
                    <option>CANCELLED</option>
                  </select>
                </td>

                <td className="border p-2">{formatDate(o.createdAt)}</td>

                <td className="border p-2">
                  <button
                    onClick={() => deleteOrder(o._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
