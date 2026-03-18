import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  FiShoppingBag, FiTruck, FiCheckCircle, FiXCircle,
  FiClock, FiTrash2, FiFilter, FiDollarSign, FiUser,
  FiMapPin, FiMail, FiPhone, FiCalendar, FiArrowRight
} from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Orders({ onSeen }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [recentFilter, setRecentFilter] = useState("NEWEST");
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantId = storedUser?.restaurant?.restaurantId;

  /* ================= FETCH LOGIC ================= */
  const fetchOrders = async () => {
    if (!restaurantId) return;
    try {
      const res = await axios.get(
        `${API_URL}/api/orders/restaurant/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
      setFilteredOrders(sorted);

      const unseenRes = await axios.get(
        `${API_URL}/api/orders/restaurant/${restaurantId}/unseen-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnseenCount(unseenRes.data.unseenCount);
      setLoading(false);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      setLoading(false);
    }
  };

  /* ================= MARK ORDERS SEEN ================= */
  const markOrdersSeen = async () => {
    if (!restaurantId) return;
    try {
      await axios.put(
        `${API_URL}/api/orders/restaurant/${restaurantId}/seen`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnseenCount(0);
      fetchOrders();
    } catch (err) {
      console.error("Mark orders seen failed:", err);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const init = async () => {
      await fetchOrders();
      const timer = setTimeout(async () => {
        await markOrdersSeen();
        if (onSeen) onSeen();
      }, 5000);
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

  /* ================= FILTER LOGIC ================= */
  const applyFilters = (payment, recent) => {
    let result = [...orders];

    if (payment !== "ALL") {
      result = result.filter((o) => o.paymentStatus === payment);
    }

    result.sort((a, b) =>
      recent === "NEWEST"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
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

  /* ================= UPDATE STATUS ================= */
  const updateOrder = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ...updates } : o))
      );

      // Update local filtered state immediately for UX
      setFilteredOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ...updates } : o))
      );
    } catch {
      alert("Update failed. Please try again.");
    }
  };

  /* ================= DELETE LOGIC ================= */
  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this order record?")) return;

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
    0
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-100";
      case "PREPARING": return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "CONFIRMED": return "bg-sky-50 text-sky-700 border-sky-100";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PAID": return "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded";
      case "FAILED": return "text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded";
      default: return "text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded";
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Orders Dashboard <span className="text-blue-600">.</span>
          </h2>
          <p className="text-gray-500 font-medium mt-1">Live order tracking and restaurant revenue management.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calculated Revenue</p>
            <p className="text-2xl font-black text-emerald-600">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs">ETB</span></p>
          </div>

          {unseenCount > 0 && (
            <div
              onClick={markOrdersSeen}
              className="group relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-3xl shadow-xl shadow-blue-200 cursor-pointer transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <FiClock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-100 uppercase">Incoming</p>
                  <p className="text-lg font-bold">{unseenCount} New Orders</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2">
            <FiFilter /> Payment Status
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => handlePaymentFilter(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">Show All Payments</option>
            <option value="PENDING">Pending Payments</option>
            <option value="PAID">Completed Payments</option>
            <option value="FAILED">Failed Payments</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase ml-1 flex items-center gap-2">
            <FiCalendar /> Time Sequence
          </label>
          <select
            value={recentFilter}
            onChange={(e) => handleRecentFilter(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value="NEWEST">Latest Orders First</option>
            <option value="OLDEST">Oldest Records First</option>
          </select>
        </div>

        <div className="hidden lg:block lg:col-span-2">
          <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-4 border border-blue-100/50">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <FiTruck size={20} />
            </div>
            <p className="text-xs font-semibold text-blue-800 leading-relaxed">
              Showing {filteredOrders.length} orders total. Real-time updates are active via secure websocket.
            </p>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Customer Profile</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Contact Info</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Order Details</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Amount</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Workflow Status</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Activity Date</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((o) => {
                const name = o.customerName
                  ? `${o.customerName.firstName} ${o.customerName.lastName}`
                  : "Guest Patron";
                const itemsList = o.items
                  .map((i) => `${i.name} (x${i.quantity})`)
                  .join(", ");

                return (
                  <tr
                    key={o._id}
                    className={`group transition-all hover:bg-gray-50/50 ${o.isSeen === false ? "bg-blue-50/30" : ""}`}
                  >
                    {/* CUSTOMER PROFILE */}
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold group-hover:scale-110 transition-transform">
                          {name.charAt(0)}
                        </div>
                        <div className="max-w-[150px]">
                          <p className="font-black text-gray-900 text-sm truncate">{name}</p>
                          <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                            <FiMapPin size={10} /> {o.deliveryAddress?.street || "Pickup"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT INFO */}
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                          <FiMail className="text-gray-300" /> {o.customerEmail || "N/A"}
                        </p>
                        <p className="text-xs text-gray-600 font-medium flex items-center gap-2">
                          <FiPhone className="text-gray-300" /> {o.customerPhone || "N/A"}
                        </p>
                      </div>
                    </td>

                    {/* ORDER DETAILS */}
                    <td className="p-6">
                      <div className="max-w-[200px]">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{itemsList}</p>
                        <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">{o.paymentMethod}</p>
                      </div>
                    </td>

                    {/* PRICE */}
                    <td className="p-6 text-center">
                      <div className="inline-block px-3 py-1 bg-gray-50 rounded-lg">
                        <p className="text-sm font-black text-gray-900">
                          {Number(o.totalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ETB</p>
                      </div>
                    </td>

                    {/* WORKFLOW STATUS */}
                    <td className="p-6">
                      <div className="flex flex-col items-center gap-2">
                        {/* Order Progress */}
                        <select
                          value={o.orderStatus}
                          onChange={(e) => updateOrder(o._id, { orderStatus: e.target.value })}
                          className={`w-32 text-[10px] font-black uppercase rounded-full border px-3 py-1.5 focus:ring-0 cursor-pointer text-center outline-none transition-all ${getOrderStatusColor(o.orderStatus)}`}
                        >
                          <option>PENDING</option>
                          <option>CONFIRMED</option>
                          <option>PREPARING</option>
                          <option>DELIVERED</option>
                          <option>CANCELLED</option>
                        </select>

                        {/* Payment Status Indicator */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Payment:</span>
                          <select
                            value={o.paymentStatus}
                            onChange={(e) => updateOrder(o._id, { paymentStatus: e.target.value })}
                            className={`text-[9px] font-black uppercase bg-transparent border-none focus:ring-0 p-0 cursor-pointer ${getPaymentStatusColor(o.paymentStatus)}`}
                          >
                            <option>PENDING</option>
                            <option>PAID</option>
                            <option>FAILED</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="p-6 text-right">
                      <p className="text-[11px] font-bold text-gray-800">{formatDate(o.createdAt)}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Confirmed</p>
                    </td>

                    {/* ACTION */}
                    <td className="p-6 text-center">
                      <button
                        onClick={() => deleteOrder(o._id)}
                        className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                        title="Archive Order"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredOrders.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-200">
              <FiShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900">Quiet in the kitchen?</h3>
            <p className="text-gray-400 text-sm mt-1">No orders match your current filter settings.</p>
            <button
              onClick={() => { setPaymentFilter("ALL"); setRecentFilter("NEWEST"); applyFilters("ALL", "NEWEST"); }}
              className="mt-6 text-blue-600 font-bold text-sm hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* FOOTER STATS INFO */}
      <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Encryption Active • Restaurant Portal v2.0</p>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-bold uppercase">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold uppercase">Socket Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}