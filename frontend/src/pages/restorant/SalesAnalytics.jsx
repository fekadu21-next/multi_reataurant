import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  ArrowUpRight, Calendar, ChevronDown, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
const API_BASE_URL = "http://localhost:5000";

export default function SalesAnalytics({ restaurantId }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  /* ================= FETCH ORDERS (Logic Preserved) ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/orders/restaurant/${restaurantId}`
        );
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (restaurantId) fetchOrders();
  }, [restaurantId]);

  /* ================= FILTER BY TIME (Logic Preserved) ================= */
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      const date = new Date(order.createdAt);
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      if (timeRange === "Last 24 Hours") return diff <= 1;
      if (timeRange === "Last 7 Days") return diff <= 7;
      if (timeRange === "Last 30 Days") return diff <= 30;
      return true;
    });
  }, [orders, timeRange]);

  /* ================= KPI (Logic Preserved) ================= */
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  /* ================= REVENUE DATA (Logic Preserved) ================= */
  const REVENUE_DATA = useMemo(() => {
    const daysMap = {};
    filteredOrders.forEach(order => {
      const day = new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      if (!daysMap[day]) {
        daysMap[day] = { name: day, sales: 0, orders: 0 };
      }
      daysMap[day].sales += order.totalPrice;
      daysMap[day].orders += 1;
    });
    return Object.values(daysMap);
  }, [filteredOrders]);

  /* ================= CATEGORY DATA (Logic Preserved) ================= */
  const CATEGORY_DATA = useMemo(() => {
    const map = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.menuItemId?.categoryId?.name || "Other";
        if (!map[cat]) map[cat] = 0;
        map[cat] += item.quantity;
      });
    });
    const colors = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6"];
    return Object.keys(map).map((name, i) => ({
      name,
      value: map[name],
      color: colors[i % colors.length],
    }));
  }, [filteredOrders]);

  /* ================= TOP DISHES (Logic Preserved) ================= */
  const TOP_DISHES = useMemo(() => {
    const map = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, sales: 0, revenue: 0 };
        }
        map[item.name].sales += item.quantity;
        map[item.name].revenue += item.quantity * item.price;
      });
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredOrders]);

  const maxSales = Math.max(...TOP_DISHES.map(d => d.sales), 1);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            {t("salesAnalyticss.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1"><p>{t("salesAnalyticss.subtitle")}</p></p>
        </div>

        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium cursor-pointer"
          >
            <option>{t("time.last24")}</option>
            <option>{t("time.last7")}</option>
            <option><option>{t("time.last30")}</option></option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("kpi.revenue"), value: `Br ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: t("kpi.orders"), value: totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: t("kpi.avgOrder"), value: `Br ${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: t("kpi.customers"), value: totalOrders, icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        ].map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={card.label}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                <h3 className="text-2xl font-bold mt-0.5">{card.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REVENUE AREA CHART */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {t("charts.revenue")} <ArrowUpRight className="text-emerald-500 w-5 h-5" />
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CATEGORY PIE CHART */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h2 className="text-xl font-bold mb-6">{t("charts.category")}</h2>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-400 text-sm">{t("charts.totalItems")}</span>
              <span className="text-2xl font-black">
                {CATEGORY_DATA.reduce((a, b) => a + b.value, 0)}
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {CATEGORY_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                </div>
                <span className="font-bold">{cat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* TOP DISHES TABLE - MODERN VERSION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="text-amber-500" /> {t("tablee.title")}
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("tablee.top5")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">{t("tablee.dish")}</th>
                <th className="px-6 py-4">{t("tablee.popularity")}</th>
                <th className="px-6 py-4">{t("tablee.popularity")}</th>
                <th className="px-6 py-4 text-right">{t("tablee.sold")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TOP_DISHES.map((dish, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{dish.name}</span>
                  </td>
                  <td className="px-6 py-4 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(dish.sales / maxSales) * 100}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{Math.round((dish.sales / maxSales) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {dish.sales} {t("tablee.sold")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-slate-900 dark:text-white text-lg">
                      Br {dish.revenue.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}