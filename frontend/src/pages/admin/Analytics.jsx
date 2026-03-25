import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  Calendar, ChevronDown, Award, Store,
  ArrowUpRight, LayoutDashboard, Download, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:5000";
/* ================= THEME CONSTANTS ================= */
const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  chart: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
};
export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("ALL");
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let ordersRes;
        if (selectedRestaurant === "ALL") {
          ordersRes = await axios.get(`${API_BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          ordersRes = await axios.get(
            `${API_BASE_URL}/api/orders/restaurant/${selectedRestaurant}`
          );
        }

        setOrders(ordersRes.data || []);
        const restaurantRes = await axios.get(`${API_BASE_URL}/api/restaurants`);
        setRestaurants(restaurantRes.data || []);
      } catch (err) {
        console.error("FETCH ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedRestaurant]);

  /* ================= FILTERING (Logic Preserved) ================= */
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      const date = new Date(order.createdAt);
      const diff = (now - date) / (1000 * 60 * 60 * 24);

      const matchTime =
        (timeRange === "Last 24 Hours" && diff <= 1) ||
        (timeRange === "Last 7 Days" && diff <= 7) ||
        (timeRange === "Last 30 Days" && diff <= 30);

      const matchRestaurant =
        selectedRestaurant === "ALL" ||
        order.restaurantId?._id === selectedRestaurant ||
        order.restaurantId === selectedRestaurant;

      return matchTime && matchRestaurant;
    });
  }, [orders, timeRange, selectedRestaurant]);

  /* ================= KPI CALCULATIONS ================= */
  const stats = useMemo(() => {
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const count = filteredOrders.length;
    const avg = count ? (revenue / count).toFixed(2) : 0;
    const customers = new Set(filteredOrders.map((o) => o.customerId)).size;

    return { revenue, count, avg, customers };
  }, [filteredOrders]);

  /* ================= CHART PREP ================= */
  const REVENUE_DATA = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => {
      const day = new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      map[day] = (map[day] || 0) + (order.totalPrice || 0);
    });
    return Object.keys(map).map(day => ({ name: day, sales: map[day] }));
  }, [filteredOrders]);

  const CATEGORY_DATA = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const cat = item.menuItemId?.categoryId?.name || "Other";
        map[cat] = (map[cat] || 0) + (item.quantity || 0);
      });
    });
    return Object.keys(map).map((name, i) => ({
      name,
      value: map[name],
      color: COLORS.chart[i % COLORS.chart.length],
    }));
  }, [filteredOrders]);

  const TOP_DISHES = useMemo(() => {
    const map = {};
    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!map[item.name]) map[item.name] = { name: item.name, sales: 0, revenue: 0 };
        map[item.name].sales += item.quantity || 0;
        map[item.name].revenue += (item.quantity || 0) * (item.price || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredOrders]);

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse font-medium">Syncing Platform Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* --- TOP BAR --- */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Admin Console</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            System-wide performance & resource allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Restaurant Selector */}
          <div className="relative group">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-semibold text-sm cursor-pointer"
            >
              <option value="ALL">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Time Selector */}
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-semibold text-sm cursor-pointer"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </header>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPIItem
          title="Gross Revenue"
          value={`Br ${stats.revenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12.5%"
          color="blue"
        />
        <KPIItem
          title="Total Orders"
          value={stats.count}
          icon={<ShoppingBag className="w-6 h-6" />}
          trend="+8.2%"
          color="emerald"
        />
        <KPIItem
          title="Avg. Ticket"
          value={`Br ${stats.avg}`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend="-2.1%"
          color="amber"
        />
        <KPIItem
          title="Customers"
          value={stats.customers}
          icon={<Users className="w-6 h-6" />}
          trend="+14.0%"
          color="purple"
        />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* REVENUE AREA CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                Financial Trajectory <ArrowUpRight className="text-emerald-500 w-5 h-5" />
              </h2>
              <p className="text-sm text-slate-400 font-medium">Daily revenue accumulation</p>
            </div>
            <RefreshCw className="w-4 h-4 text-slate-300 cursor-pointer hover:rotate-180 transition-transform duration-500" />
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA.length ? REVENUE_DATA : [{ name: 'N/A', sales: 0 }]}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* PIE CHART (HOVER ONLY LABELS) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight">Category Mix</h2>
            <p className="text-sm text-slate-400 font-medium">Demand by food group</p>
          </div>

          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-800 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold border border-slate-700">
                          {payload[0].name}: {payload[0].value} Items
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total</span>
              <span className="text-3xl font-black">
                {CATEGORY_DATA.reduce((a, b) => a + b.value, 0)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {CATEGORY_DATA.map((c, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 truncate">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* --- BOTTOM SECTION: TOP DISHES --- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Award className="text-amber-500" /> Elite Performing Items
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">Products driving the most volume</p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline">View All Inventory</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Popularity Score</th>
                <th className="px-8 py-5">Units Sold</th>
                <th className="px-8 py-5 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence>
                {TOP_DISHES.map((d, i) => (
                  <motion.tr
                    key={d.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-bold text-blue-600">
                          {i + 1}
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.sales / TOP_DISHES[0].sales) * 100}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {d.sales} Qty
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="font-black text-slate-900 dark:text-white">
                        Br {d.revenue.toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function KPIItem({ title, value, icon, trend, color }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <h2 className="text-2xl font-black mt-1 tabular-nums">{value}</h2>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        {React.cloneElement(icon, { size: 80 })}
      </div>
    </motion.div>
  );
}