import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";
import {
  FiPackage,
  FiDollarSign,
  FiPercent,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
  FiTrash2,
  FiRefreshCw
} from "react-icons/fi";

const API_URL = "http://localhost:5000/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(res.data);
      setError("");
    } catch (err) {
      setError("Failed to sync with server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
    // Refresh every 10 seconds to keep dashboard live
    const interval = setInterval(() => fetchOrders(false), 10000);
    return () => clearInterval(interval);
  }, []);

  // ---------------- EXTRACT UNIQUE RESTAURANTS ----------------
  useEffect(() => {
    const unique = [
      ...new Map(
        orders
          .filter((o) => o?.restaurantId?._id)
          .map((o) => [o.restaurantId._id, o.restaurantId])
      ).values(),
    ];
    setRestaurants(unique);
  }, [orders]);

  // ---------------- FILTERING LOGIC ----------------
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // filter by restaurant if selected
    if (selectedRestaurant) {
      filtered = orders.filter(
        (o) => o?.restaurantId?._id === selectedRestaurant
      );
    }

    // sort newest orders first
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders, selectedRestaurant]);

  // ---------------- ADVANCED ANALYTICS (Weekly & Lifetime) ----------------
  const stats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    // Lifetime accumulators
    let totalRevenue = 0;
    let totalCommission = 0;

    // Weekly accumulators
    let weeklyAdminRevenue = 0;
    let weeklyAdminCommission = 0;

    const restaurantWeekly = {};
    const restaurantCODWeekly = {};

    filteredOrders.forEach((order) => {
      const price = order.totalPrice || 0;
      const commission = order.adminCommission || 0;
      const restaurantName = order.restaurantId?.name || "Unknown Restaurant";
      const createdDate = new Date(order.createdAt);
      const isThisWeek = isWithinInterval(createdDate, { start, end });

      // Add to Lifetime
      totalRevenue += price;
      totalCommission += commission;

      if (isThisWeek) {
        // Add to Weekly Admin Totals
        weeklyAdminRevenue += price;
        weeklyAdminCommission += commission;

        // Weekly Per Restaurant (Net: Price - Commission)
        const netToRestaurant = price - commission;
        restaurantWeekly[restaurantName] = (restaurantWeekly[restaurantName] || 0) + netToRestaurant;

        // Weekly COD Per Restaurant
        if (order.paymentMethod === "COD") {
          restaurantCODWeekly[restaurantName] = (restaurantCODWeekly[restaurantName] || 0) + price;
        }
      }
    });

    return {
      totalRevenue,
      totalCommission,
      weeklyAdminRevenue,
      weeklyAdminCommission,
      restaurantWeekly,
      restaurantCODWeekly,
      weekRange: `${format(start, "MMM dd")} - ${format(end, "MMM dd")}`
    };
  }, [filteredOrders]);

  // ---------------- ACTION HANDLERS ----------------

  const deleteOrder = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // remove order from UI
      setOrders((prev) => prev.filter((order) => order._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updateStatus = async (id, field, value) => {
    try {
      const updates = { [field]: value };
      const response = await axios.put(
        `${API_URL}/${id}/status`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === id ? { ...order, ...response.data.order } : order
        )
      );

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      alert(`Update failed: ${errorMessage}`);
      fetchOrders(false);
    }
  };

  // ---------------- UI HELPERS ----------------
  const getStatusStyle = (status) => {
    const map = {
      PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      CANCELLED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      PAID: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      FAILED: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };
    return map[status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-4 md:p-8 font-sans text-slate-900 transition-colors duration-300">

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Orders Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time logistics and revenue tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">All Establishments</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Admin Lifetime Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FiDollarSign size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lifetime Revenue</span>
            </div>
            <h3 className="text-2xl font-bold dark:text-white">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total across all dates</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FiPercent size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lifetime Comm.</span>
            </div>
            <h3 className="text-2xl font-bold dark:text-white">${stats.totalCommission.toFixed(2)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Admin earnings to date</p>
          </div>

          {/* Weekly Admin Summary */}
          <div className="bg-slate-900 dark:bg-indigo-950 p-6 rounded-2xl shadow-md text-white transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-800 dark:bg-indigo-900 rounded-lg text-indigo-400">
                <FiPackage size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Admin</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm">Rev:</span>
                <span className="font-bold">${stats.weeklyAdminRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 dark:border-indigo-900 pt-1">
                <span className="text-slate-400 text-sm">Comm:</span>
                <span className="font-bold text-indigo-400">${stats.weeklyAdminCommission.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-widest">{stats.weekRange}</p>
          </div>

          {/* COD Highlight */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                <FiTruck size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Weekly COD Total</span>
            </div>
            <h3 className="text-2xl font-bold dark:text-white">
              ${Object.values(stats.restaurantCODWeekly).reduce((a, b) => a + b, 0).toFixed(2)}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Cash to collect this week</p>
          </div>
        </div>

        {/* SECONDARY ANALYTICS: Weekly Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Weekly Revenue (Net per Restaurant)</h2>
            </div>
            <div className="p-6">
              {Object.keys(stats.restaurantWeekly).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.restaurantWeekly).map(([name, val]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{name}</span>
                      <span className="text-sm font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">${val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">No data for this week</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-bold text-slate-800 dark:text-slate-200">Weekly COD Collection List</h2>
            </div>
            <div className="p-6">
              {Object.keys(stats.restaurantCODWeekly).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.restaurantCODWeekly).map(([name, val]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{name}</span>
                      <span className="text-sm font-bold bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full">${val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">No COD orders this week</p>
              )}
            </div>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 border-b dark:border-slate-800">Customer Info</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800">Delivery Address</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800">Order Details</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800 text-center">Payment</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800">Financials</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800 text-right">Update Actions</th>
                  <th className="px-6 py-4 border-b dark:border-slate-800 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                      <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Syncing Orders...</p>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-slate-400">No records found matching criteria.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {order.customerName?.firstName} {order.customerName?.lastName}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <FiPhone className="mr-1.5" /> {order.customerPhone || "No Phone"}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <FiMail className="mr-1.5" /> {order.customerEmail || "No Email"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex items-start text-sm text-slate-700 dark:text-slate-300">
                          <FiMapPin className="mt-1 mr-2 text-slate-400 shrink-0" />
                          <span>
                            {order.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                            <span className="font-semibold">{order.deliveryAddress?.city}</span>
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase tracking-tight">
                          {order.restaurantId?.name || "Unassigned"}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {order.items?.map((i) => `${i.name} (${i.quantity})`).join(", ")}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2 italic">
                          {format(new Date(order.createdAt), "MMM dd, hh:mm a")}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase shadow-sm ${getStatusStyle(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase shadow-sm ${getStatusStyle(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            via {order.paymentMethod}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">${(order.totalPrice || 0).toFixed(2)}</div>
                        <div className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-0.5">-${(order.adminCommission || 0).toFixed(2)} Comm.</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-end">
                          <select
                            onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                            className="text-xs border border-slate-200 dark:border-slate-700 rounded-md p-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={order.orderStatus}
                          >
                            <option disabled value="">Order Status</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CANCELLED">CANCELLED</option>
                            {/* <option value="DELIVERED">DELIVERED</option> */}
                          </select>

                          <select
                            onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                            className="text-xs border border-slate-200 dark:border-slate-700 rounded-md p-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={order.paymentStatus}
                          >
                            <option disabled value="">Payment Status</option>
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setDeleteId(order._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-2"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">
              Confirm Deletion
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Are you sure you want to remove this order from the system? This action is irreversible and will affect your revenue analytics.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2.5 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel Action
              </button>
              <button
                onClick={deleteOrder}
                className="px-6 py-2.5 text-sm font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}