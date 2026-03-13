import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";

const API_URL = "http://localhost:5000/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (o) =>
          o.paymentStatus === "PAID" &&
          o.orderStatus === "CONFIRMED"
      );

      setOrders(filtered);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- EXTRACT RESTAURANTS ----------------
  useEffect(() => {
    const unique = [
      ...new Map(
        orders.map((o) => [o.restaurantId?._id, o.restaurantId])
      ).values(),
    ];
    setRestaurants(unique);
  }, [orders]);

  // ---------------- FILTER ----------------
  const filteredOrders = useMemo(() => {
    if (!selectedRestaurant) return orders;
    return orders.filter(
      (o) => o.restaurantId?._id === selectedRestaurant
    );
  }, [orders, selectedRestaurant]);

  // ---------------- STATS ----------------
  const { weeklyRevenue, totalCommission } = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    let revenue = 0;
    let commission = 0;

    filteredOrders.forEach((order) => {
      const created = new Date(order.createdAt);

      if (isWithinInterval(created, { start, end })) {
        revenue += order.totalPrice || 0;
        commission += order.adminCommission || 0;
      }
    });

    return {
      weeklyRevenue: revenue,
      totalCommission: commission,
    };
  }, [filteredOrders]);

  const formatDate = (date) =>
    new Date(date).toLocaleString();

  // ---------------- UI ----------------
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Orders (PAID & CONFIRMED)
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">
          Filter by Restaurant:
        </label>
        <select
          className="border p-2 rounded"
          value={selectedRestaurant}
          onChange={(e) =>
            setSelectedRestaurant(e.target.value)
          }
        >
          <option value="">All Restaurants</option>
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mb-4 p-4 bg-gray-50 border rounded">
        <p>
          <strong>Weekly Revenue:</strong> $
          {weeklyRevenue.toFixed(2)}
        </p>
        <p>
          <strong>Total Admin Commission:</strong> $
          {totalCommission.toFixed(2)}
        </p>
        <p>
          <strong>Total Orders:</strong>{" "}
          {filteredOrders.length}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Restaurant</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Commission</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="border p-2">
                    {order.customerName?.firstName}{" "}
                    {order.customerName?.lastName}
                  </td>
                  <td className="border p-2">
                    {order.restaurantId?.name}
                  </td>
                  <td className="border p-2">
                    {order.items
                      .map(
                        (item) =>
                          `${item.name} x ${item.quantity}`
                      )
                      .join(", ")}
                  </td>
                  <td className="border p-2">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="border p-2">
                    ${order.adminCommission.toFixed(2)}
                  </td>
                  <td className="border p-2">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}