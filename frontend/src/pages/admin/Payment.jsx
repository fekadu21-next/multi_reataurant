import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  DollarSign, Wallet, Building2, Landmark,
  Calendar, ChevronDown, Download, RefreshCcw,
  ArrowUpRight, PieChart as PieIcon, Percent, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
const API_BASE_URL = "http://localhost:5000";

/* ================= COMPONENT ================= */

export default function PaymentAnalytics() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("ALL");
  const [timeRange, setTimeRange] = useState(t("last7Days"));
  const [loading, setLoading] = useState(true);

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch Orders (Admin endpoint or Restaurant specific)
        const endpoint =
          selectedRestaurant === "ALL"
            ? `${API_BASE_URL}/api/orders`
            : `${API_BASE_URL}/api/orders/restaurant/${selectedRestaurant}`;
        const ordersRes = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch Restaurants for filter
        const resList = await axios.get(`${API_BASE_URL}/api/restaurants`);

        setOrders(ordersRes.data || []);
        setRestaurants(resList.data || []);
      } catch (err) {
        console.error("Payment Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedRestaurant]);

  /* ================= ADVANCED FILTERING LOGIC ================= */
  const filteredData = useMemo(() => {
    const now = new Date();

    return orders
      .filter(order => {
        const date = new Date(order.createdAt);
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);

        return (
          (timeRange === "Last 24 Hours" && diffDays <= 1) ||
          (timeRange === "Last 7 Days" && diffDays <= 7) ||
          (timeRange === "Last 30 Days" && diffDays <= 30)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, timeRange]);

  /* ================= PAYMENT METHOD MATRIX ================= */
  // Calculating totals for COD, CHAPA, and BANK/TELEBIRR
  const paymentMetrics = useMemo(() => {
    const init = { gross: 0, commission: 0, net: 0 };

    const matrix = {
      CHAPA: {
        ...init,
        label: t("chapaDigital"),
        color: "#3b82f6",
        icon: <ShieldCheck />,
      },
      BANK: {
        ...init,
        label: t("bankTelebirr")
        ,
        color: "#8b5cf6",
        icon: <Landmark />,
      },
      COD: {
        ...init,
        label: t("cashOnDelivery"),
        color: "#f59e0b",
        icon: <Wallet />,
      },
    };

    filteredData.forEach((order) => {
      // ✅ ONLY COUNT SUCCESSFUL PAYMENTS
      if (order.paymentStatus !== "PAID") return;

      // ✅ Normalize payment method
      let method = (order.paymentMethod || "").toUpperCase();

      if (method.includes("CHAPA")) method = "CHAPA";
      else if (method.includes("BANK") || method.includes("TELEBIRR"))
        method = "BANK";
      else method = "COD";

      const target = matrix[method];

      // ✅ Ensure required financial fields exist
      if (
        order.totalPrice == null ||
        order.adminCommission == null ||
        order.restaurantAmount == null
      ) {
        // Skip incomplete financial records
        return;
      }

      const gross = order.totalPrice;
      const commission = order.adminCommission;
      const net = order.restaurantAmount;

      // ✅ Aggregate totals
      target.gross += gross;
      target.commission += commission;
      target.net += net;
    });

    return Object.values(matrix);
  }, [filteredData]);

  /* ================= KPI TOTALS ================= */
  const globalStats = useMemo(() => {
    const gross = paymentMetrics.reduce((sum, m) => sum + m.gross, 0);
    const comm = paymentMetrics.reduce((sum, m) => sum + m.commission, 0);
    return { gross, comm, net: gross - comm };
  }, [paymentMetrics]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">{t("processingLedger")}...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* --- HEADER --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            {t("payments")} <span className="text-blue-600">{t("portal")}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t("revenueTracking")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-sm"
            >
              <option value="ALL">{t("allRestaurants")}</option>
              {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-sm"
            >
              <option>{t("last24Hours")}</option>
              <option>{t("last7Days")}</option>
              <option>{t("last30Days")}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* --- TOP KPI ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <MainStat label={t("platformGross")} value={globalStats.gross} sub="Total processed volume" icon={<DollarSign />} color="blue" />
        <MainStat label={t("earnedCommission")} value={globalStats.comm} sub="Your 10% platform share" icon={<Percent />} color="emerald" />
        <MainStat label={t("restaurantPayouts")} value={globalStats.net} sub="Net amount to be settled" icon={<ArrowUpRight />} color="purple" />
      </div>

      {/* --- PAYMENT METHOD MATRIX GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {paymentMetrics.map((method, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {method.icon}
                </div>
                <h3 className="font-black uppercase tracking-tight">{method.label}</h3>
              </div>
              <span className="text-[10px] font-black px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg uppercase">{t("active")}</span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("totalRevenue")}</p>
                <p className="text-3xl font-black">Br {method.gross.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black text-rose-500 uppercase mb-1">{t("commission")}</p>
                  <p className="text-lg font-bold">Br {method.commission.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">{t("restaurantNet")}</p>
                  <p className="text-lg font-bold">Br {method.net.toLocaleString()}</p>
                </div>
              </div>

              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(method.gross / globalStats.gross) * 100 || 0}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- VISUAL ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* BAR CHART: METHOD COMPARISON */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <PieIcon className="text-blue-600" /> {t("revenueDistribution")}
            </h3>
            <RefreshCcw className="text-slate-300 w-4 h-4 cursor-pointer hover:rotate-180 transition-transform duration-700" />
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMetrics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="gross" radius={[10, 10, 0, 0]} barSize={50}>
                  {paymentMetrics.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVENUE SPLIT SUMMARY */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-black uppercase tracking-tight mb-8">{t("financialHealth")}</h3>
          <div className="space-y-8">
            <HealthItem
              label={t("digitalAdoption")}
              percent={((paymentMetrics.find(m => m.label.includes("Chapa"))?.gross / globalStats.gross) * 100) || 0}
              color="blue"
            />
            <HealthItem
              label={t("bankSettlement")}
              percent={((paymentMetrics.find(m => m.label.includes("Bank"))?.gross / globalStats.gross) * 100) || 0}
              color="purple"
            />
            <HealthItem
              label={t("cashExposure")}
              percent={((paymentMetrics.find(m => m.label.includes("Cash"))?.gross / globalStats.gross) * 100) || 0}
              color="amber"
            />
          </div>

          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white self-start">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 dark:text-blue-100 uppercase text-xs tracking-widest">{t("platformNote")}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-medium leading-relaxed">
                  {t("platformNoteDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function MainStat({ label, value, sub, icon, color }) {
  const themes = {
    blue: "bg-blue-600 shadow-blue-500/20",
    emerald: "bg-emerald-600 shadow-emerald-500/20",
    purple: "bg-purple-600 shadow-purple-500/20",
  };
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${themes[color]} p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            {React.cloneElement(icon, { size: 24 })}
          </div>
          <ArrowUpRight className="opacity-40" />
        </div>
        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <h2 className="text-4xl font-black mt-1 tracking-tighter">Br {value.toLocaleString()}</h2>
        <p className="text-white/40 text-[10px] font-bold mt-2 uppercase tracking-widest">{sub}</p>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
    </motion.div>
  );
}

function HealthItem({ label, percent, color }) {
  const colors = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
  };
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>
        <span className="text-sm font-black">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
}