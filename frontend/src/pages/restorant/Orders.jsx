import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";
import {
  FiShoppingBag, FiTruck, FiActivity,
  FiClock, FiFilter, FiDollarSign,
  FiMapPin, FiMail, FiPhone, FiCalendar, FiRefreshCw, FiCreditCard
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
const API_URL = "http://localhost:5000";

export default function Orders({ onSeen }) {
  const { t } = useTranslation();
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
  const fetchOrders = useCallback(async (showLoading = false) => {
    if (!restaurantId) return;
    if (showLoading) setLoading(true);
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
    } catch (err) {
      console.error("Fetch orders failed:", err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, token]);

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
    fetchOrders(true);
    const timer = setTimeout(() => {
      markOrdersSeen();
      if (onSeen) onSeen();
    }, 5000);

    const socket = io(API_URL, { auth: { token } });
    socket.on("newOrder", (data) => {
      if (data.restaurantId === restaurantId) fetchOrders();
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, [restaurantId, fetchOrders]);

  /* ================= REVENUE CALCULATIONS ================= */
  const stats = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    let totalNetRevenue = 0;
    let totalNetCOD = 0;
    let weeklyNetRevenue = 0;
    let weeklyNetCOD = 0;

    orders.forEach((o) => {
      const netAmount = (o.totalPrice || 0) - (o.adminCommission || 0);
      const createdDate = new Date(o.createdAt);
      const isThisWeek = isWithinInterval(createdDate, { start, end });

      totalNetRevenue += netAmount;
      if (o.paymentMethod === "COD") totalNetCOD += netAmount;

      if (isThisWeek) {
        weeklyNetRevenue += netAmount;
        if (o.paymentMethod === "COD") weeklyNetCOD += netAmount;
      }
    });

    return {
      totalNetRevenue,
      totalNetCOD,
      weeklyNetRevenue,
      weeklyNetCOD,
      range: `${format(start, "MMM dd")} - ${format(end, "MMM dd")}`
    };
  }, [orders]);

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

  /* ================= UPDATE STATUS ================= */
  const updateOrder = async (id, updates) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updates } : o)));
      setFilteredOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updates } : o)));
    } catch {
      alert("Status update failed.");
    }
  };

  /* ================= STYLING UTILS ================= */
  const getOrderStatusStyle = (status) => {
    const styles = {
      PENDING: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900/50",
      CANCELLED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500 border-red-200 dark:border-red-900/50",
      DELIVERED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900/50",
      PREPARING: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
      CONFIRMED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    };
    return styles[status] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-400 border-gray-200 dark:border-slate-700";
  };

  const getPaymentStatusStyle = (status) => {
    const styles = {
      PAID: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-900/30",
      PENDING: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-900/30",
      FAILED: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-500 border-red-200 dark:border-red-900/30",
    };
    return styles[status] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-500 border-gray-200 dark:border-slate-700";
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700 bg-transparent text-slate-900 dark:text-slate-100">

      {/* HEADER & TOP STAT CARDS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
            {t("restaurantHub")} <span className="text-blue-600">.</span>
          </h2>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1 transition-colors">{t("liveRevenue")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-right transition-colors">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t("totalNetRevenue")}</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
              {stats.totalNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs">ETB</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-right transition-colors">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest"> {t("totalNetCOD")}</p>
            <p className="text-2xl font-black text-orange-600 dark:text-orange-500">
              {stats.totalNetCOD.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs">ETB</span>
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 rounded-[2rem] text-white shadow-lg transition-colors">
          <div className="flex justify-between items-center">
            <FiActivity size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{t("weeklyNetRevenue")}</p>
          </div>
          <h2 className="text-3xl font-black mt-4">${stats.weeklyNetRevenue.toFixed(2)}</h2>
          <p className="text-xs font-medium opacity-70 mt-1">{stats.range}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-orange-900/30 p-6 rounded-[2rem] shadow-sm transition-colors">
          <div className="flex justify-between items-center text-orange-600 dark:text-orange-500">
            <FiTruck size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest"> {t("weeklyNetCOD")}</p>
          </div>
          <h2 className="text-3xl font-black mt-4 text-gray-900 dark:text-white">${stats.weeklyNetCOD.toFixed(2)}</h2>
          <p className="text-xs font-medium text-gray-400 dark:text-slate-500 mt-1"> {t("cashToCollect")}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1 flex items-center gap-2">
            <FiFilter /> {t("paymentFilter")}
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); applyFilters(e.target.value, recentFilter); }}
            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="ALL"> {t("allPayments")}</option>
            <option value="PAID">{t("paidOnly")}</option>
            <option value="PENDING">{t("pendingOnly")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1 flex items-center gap-2">
            <FiCalendar />  {t("sortOrder")}
          </label>
          <select
            value={recentFilter}
            onChange={(e) => { setRecentFilter(e.target.value); applyFilters(paymentFilter, e.target.value); }}
            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="NEWEST"> {t("latestFirst")}</option>
            <option value="OLDEST">{t("oldestFirst")}</option>
          </select>
        </div>
        <div className="lg:col-span-2 text-right">
          <button onClick={() => fetchOrders(true)} className="p-4 bg-gray-900 dark:bg-slate-800 text-white dark:text-blue-400 rounded-2xl hover:bg-black dark:hover:bg-slate-700 transition-all shadow-lg">
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 transition-colors">
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-left">{t("customerProfile")}</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-left">{t("customerProfile")}</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-left">{t("orderItems")}</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-left">{t("orderItems")}</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">{t("workflow")}</th>
                <th className="p-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">{t("workflow")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center text-gray-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">{t("syncing")}...</td></tr>
              ) : filteredOrders.map((o) => (
                <tr key={o._id} className={`group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors ${o.isSeen === false ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>

                  {/* Profile with Email & Phone */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-gray-500 dark:text-slate-400 shadow-sm transition-colors">
                        {o.customerName?.firstName?.charAt(0) || "G"}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-slate-100 text-sm transition-colors">
                          {o.customerName?.firstName} {o.customerName?.lastName}
                        </p>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 flex items-center gap-1"><FiPhone size={10} /> {o.customerPhone}</p>
                          <p className="text-[10px] font-bold text-blue-500/70 dark:text-blue-400/70 flex items-center gap-1 lowercase tracking-tight"><FiMail size={10} /> {o.customerEmail}</p>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="p-6">
                    <div className="flex items-start gap-2 text-xs">
                      <FiMapPin className="mt-0.5 text-gray-400 dark:text-slate-500 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-700 dark:text-slate-300 transition-colors">{o.deliveryAddress?.street || "Pickup Order"}</p>
                        <p className="font-black text-indigo-500 dark:text-indigo-400 uppercase text-[9px] mt-1 tracking-wider transition-colors">{o.deliveryAddress?.city}</p>
                      </div>
                    </div>
                  </td>

                  {/* Order Items */}
                  <td className="p-6">
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 line-clamp-1 transition-colors">
                      {o.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-tighter transition-colors">
                      {t("ordered")}: {format(new Date(o.createdAt), "MMM dd, HH:mm")}
                    </p>
                  </td>

                  {/* Payment Method Column */}
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500 transition-colors">
                        <FiCreditCard size={14} />
                      </div>
                      <span className="text-[10px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest transition-colors">{o.paymentMethod}</span>
                    </div>
                  </td>

                  {/* Workflow / Status */}
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateOrder(o._id, { orderStatus: e.target.value })}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black border uppercase outline-none cursor-pointer transition-all shadow-sm bg-transparent dark:bg-slate-900 ${getOrderStatusStyle(o.orderStatus)}`}
                      >
                        <option value="PENDING" className="dark:bg-slate-900">PENDING</option>
                        <option value="CONFIRMED" className="dark:bg-slate-900">CONFIRMED</option>
                        <option value="PREPARING" className="dark:bg-slate-900">PREPARING</option>
                        <option value="DELIVERED" className="dark:bg-slate-900">DELIVERED</option>
                        {/* <option value="CANCELLED" className="dark:bg-slate-900">CANCELLED</option> */}
                      </select>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase tracking-tighter transition-colors ${getPaymentStatusStyle(o.paymentStatus)}`}>
                        {t("payment")}: {o.paymentStatus}
                      </span>
                    </div>
                  </td>

                  {/* Net Earnings with Commission Breakdown */}
                  <td className="p-6 text-right">
                    <div className="inline-block text-right">
                      <div className="font-black text-emerald-600 dark:text-emerald-500 text-sm tracking-tight transition-colors">
                        ETB {((o.totalPrice || 0) - (o.adminCommission || 0)).toFixed(2)}
                      </div>
                      <div className="flex flex-col mt-1">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase transition-colors">{t("gross")}: {o.totalPrice?.toFixed(2)}</span>
                        <span className="text-[9px] font-bold text-rose-400 dark:text-rose-500/80 uppercase transition-colors">{t("commission")}: -{o.adminCommission?.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}