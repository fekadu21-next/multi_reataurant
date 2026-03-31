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
  FiRefreshCw,
  FiUser,
  FiCreditCard,
  FiClock
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000/api/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t } = useTranslation();

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
    if (selectedRestaurant) {
      filtered = orders.filter(
        (o) => o?.restaurantId?._id === selectedRestaurant
      );
    }
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [orders, selectedRestaurant]);

  // ---------------- ADVANCED ANALYTICS (Weekly & Lifetime) ----------------
  const stats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    let totalRevenue = 0;
    let totalCommission = 0;
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

      totalRevenue += price;
      totalCommission += commission;

      if (isThisWeek) {
        weeklyAdminRevenue += price;
        weeklyAdminCommission += commission;
        const netToRestaurant = price - commission;
        restaurantWeekly[restaurantName] = (restaurantWeekly[restaurantName] || 0) + netToRestaurant;

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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] p-3 md:p-8 font-sans text-slate-900 transition-colors duration-300">

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("ordersDashboard")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t("realtimeTracking")}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm font-medium text-sm"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">{t("allEstablishments")}</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400 text-[10px]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FiDollarSign size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("lifetimeRevenue")}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold dark:text-white">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("totalAcrossDates")}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FiPercent size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("lifetimeCommission")}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold dark:text-white">${stats.totalCommission.toFixed(2)}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("adminEarnings")}</p>
          </div>

          <div className="bg-slate-900 dark:bg-indigo-950 p-5 md:p-6 rounded-2xl shadow-md text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-800 dark:bg-indigo-900 rounded-lg text-indigo-400">
                <FiPackage size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("weeklyAdmin")}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{t("revenueShort")}:</span>
                <span className="font-bold text-sm">${stats.weeklyAdminRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 dark:border-indigo-900 pt-1">
                <span className="text-slate-400 text-xs">{t("commissionShort")}:</span>
                <span className="font-bold text-sm text-indigo-400">${stats.weeklyAdminCommission.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 mt-3 uppercase tracking-widest">{stats.weekRange}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                <FiTruck size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t("weeklyCOD")}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold dark:text-white">
              ${Object.values(stats.restaurantCODWeekly).reduce((a, b) => a + b, 0).toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{t("cashToCollect")}</p>
          </div>
        </div>

        {/* SECONDARY ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t("weeklyRevenuePerRestaurant")}</h2>
            </div>
            <div className="p-6">
              {Object.keys(stats.restaurantWeekly).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.restaurantWeekly).map(([name, val]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{name}</span>
                      <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">${val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">{t("noWeeklyData")}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t("weeklyCODList")}</h2>
            </div>
            <div className="p-6">
              {Object.keys(stats.restaurantCODWeekly).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(stats.restaurantCODWeekly).map(([name, val]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{name}</span>
                      <span className="text-xs font-bold bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full">${val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs italic">{t("noCODThisWeek")}</p>
              )}
            </div>
          </div>
        </div>

        {/* ORDERS CONTAINER - Responsive Table vs Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Mobile Loading / Empty State */}
          {loading && (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">{t("syncingOrders")}...</p>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="py-20 text-center text-slate-400">{t("noRecords")}.</div>
          )}

          {/* TABLE VIEW - Hidden on Small Mobile */}
          {!loading && filteredOrders.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4 border-b dark:border-slate-800">{t("customerInfo")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800">{t("deliveryAddress")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800">{t("orderDetails")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800 text-center">{t("payment")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800">{t("financials")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800 text-right">{t("updateActions")}</th>
                    <th className="px-6 py-4 border-b dark:border-slate-800 text-right">{t("remove")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {order.customerName?.firstName} {order.customerName?.lastName}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                            <FiPhone className="mr-1.5" /> {order.customerPhone || "No Phone"}
                          </div>
                          <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                            <FiMail className="mr-1.5" /> {order.customerEmail || "No Email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <div className="flex items-start text-xs text-slate-700 dark:text-slate-300">
                          <FiMapPin className="mt-1 mr-2 text-slate-400 shrink-0" />
                          <span>{order.deliveryAddress?.street && `${order.deliveryAddress.street}, `} <span className="font-semibold">{order.deliveryAddress?.city}</span></span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1 uppercase">{order.restaurantId?.name || "Unassigned"}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{order.items?.map((i) => `${i.name} (${i.quantity})`).join(", ")}</div>
                        <div className="text-[9px] text-slate-400 mt-2 italic">{format(new Date(order.createdAt), "MMM dd, hh:mm a")}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase shadow-sm ${getStatusStyle(order.orderStatus)}`}>{order.orderStatus}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase shadow-sm ${getStatusStyle(order.paymentStatus)}`}>{order.paymentStatus}</span>
                          <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase">via {order.paymentMethod}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">${(order.totalPrice || 0).toFixed(2)}</div>
                        <div className="text-[10px] text-rose-500 dark:text-rose-400 font-medium mt-0.5">-${(order.adminCommission || 0).toFixed(2)} Comm.</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 items-end">
                          <select
                            onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                            className="text-[10px] border border-slate-200 dark:border-slate-700 rounded-md p-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                            value={order.orderStatus}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          <select
                            onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                            className="text-[10px] border border-slate-200 dark:border-slate-700 rounded-md p-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                            value={order.paymentStatus}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setDeleteId(order._id); setShowDeleteModal(true); }} className="text-slate-400 hover:text-red-500 p-2">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CARD VIEW - Visible only on Mobile */}
          {!loading && filteredOrders.length > 0 && (
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">#{order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{format(new Date(order.createdAt), "MMM dd, hh:mm a")}</div>
                    </div>
                    <button onClick={() => { setDeleteId(order._id); setShowDeleteModal(true); }} className="text-slate-300 hover:text-red-500 p-1">
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400"><FiUser size={14} /></div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{order.customerName?.firstName} {order.customerName?.lastName}</div>
                        <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400"><FiMapPin size={14} /></div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{order.deliveryAddress?.city}, {order.deliveryAddress?.street}</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-black text-indigo-500 uppercase mb-1">{order.restaurantId?.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{order.items?.map((i) => `${i.name} (${i.quantity})`).join(", ")}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400">{t("status")}</span>
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase ${getStatusStyle(order.orderStatus)}`}>{order.orderStatus}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border uppercase ${getStatusStyle(order.paymentStatus)}`}>{order.paymentStatus}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400">{t("financials")}</span>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">${(order.totalPrice || 0).toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                      <select
                        onChange={(e) => updateStatus(order._id, "orderStatus", e.target.value)}
                        className="flex-1 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        value={order.orderStatus}
                      >
                        <option value="PENDING">ORDER: PENDING</option>
                        <option value="CANCELLED">ORDER: CANCELLED</option>
                      </select>
                      <select
                        onChange={(e) => updateStatus(order._id, "paymentStatus", e.target.value)}
                        className="flex-1 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        value={order.paymentStatus}
                      >
                        <option value="PENDING">PAY: PENDING</option>
                        <option value="PAID">PAY: PAID</option>
                        <option value="FAILED">PAY: FAILED</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL - Consistent UI */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t("confirmDeletion")}</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{t("deleteOrderWarning")}</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="order-2 sm:order-1 px-6 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all">
                {t("cancelAction")}
              </button>
              <button onClick={deleteOrder} className="order-1 sm:order-2 px-6 py-2.5 text-xs font-bold bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">
                {t("deletePermanently")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}