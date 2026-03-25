import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  FiHome, FiUsers, FiAlertCircle, FiLogOut, FiShoppingBag, FiFileText,
  FiMoon, FiSun, FiGrid, FiTrendingUp, FiActivity, FiMessageSquare,
  FiGlobe, FiChevronDown, FiClock, FiCheckCircle
} from "react-icons/fi";
import { FaCreditCard, FaStore } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("admin_active_tab") || "dashboard";
  });
  const [unseenCount, setUnseenCount] = useState(0);
  const [openLang, setOpenLang] = useState(false);

  // ---------------- PERSISTENCE & SOCKETS ----------------
  useEffect(() => {
    localStorage.setItem("admin_active_tab", activePage);
    const socket = io(SOCKET_URL, { withCredentials: true });
    const adminId = localStorage.getItem("adminId");
    if (adminId) socket.emit("registerAdmin", adminId);

    socket.on("adminNewOrder", () => setUnseenCount((prev) => prev + 1));
    return () => socket.disconnect();
  }, [activePage]);

  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/admin/unseen-count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnseenCount(res.data.unseenCount);
      } catch (err) { console.error("Unseen count error", err); }
    };
    fetchUnseen();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className={`flex w-full min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex w-full min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">

        {/* ---------------- Sidebar ---------------- */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <FiActivity size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black dark:text-white uppercase leading-none">Addis<span className="text-indigo-600">Eats</span></h1>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">{t("centralAdmin")}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <SidebarItem icon={<FiHome />} label={t("overview")} active={activePage === "dashboard"} onClick={() => setActivePage("dashboard")} />
            <SidebarItem icon={<FiUsers />} label={t("users")} active={activePage === "users"} onClick={() => setActivePage("users")} />
            <SidebarItem icon={<FiShoppingBag />} label={t("restaurants")} active={activePage === "restaurants"} onClick={() => setActivePage("restaurants")} />
            <SidebarItem icon={<FiGrid />} label={t("categories")} active={activePage === "categories"} onClick={() => setActivePage("categories")} />
            <SidebarItem icon={<FiFileText />} label={t("orders")} active={activePage === "orders"} onClick={() => setActivePage("orders")} badge={unseenCount} />
            <SidebarItem icon={<FaCreditCard />} label={t("payments")} active={activePage === "payment"} onClick={() => setActivePage("payment")} />
            <SidebarItem icon={<FiTrendingUp />} label={t("analytics")} active={activePage === "analytics"} onClick={() => setActivePage("analytics")} />
            <SidebarItem icon={<FiMessageSquare />} label={t("reviews")} active={activePage === "reviews"} onClick={() => setActivePage("reviews")} />
          </nav>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all font-semibold text-sm">
              {darkMode ? <><FiSun className="text-yellow-500" /> {t("lightMode")}</> : <><FiMoon className="text-indigo-500" /> {t("nightMode")}</>}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all">
              <FiLogOut /> {t("logout")}
            </button>
          </div>
        </aside>

        {/* ---------------- Main Content ---------------- */}
        <main className="flex-1 ml-72 p-8 lg:p-12">
          <header className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {activePage === "dashboard" ? t("platformAnalytics") : t(activePage)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">{t("welcomeBackAdmin")}</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Language Switcher */}
              <div className="relative">
                <button onClick={() => setOpenLang(!openLang)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all text-xs font-black uppercase text-slate-600 dark:text-slate-300">
                  <FiGlobe className="text-indigo-600" />
                  {i18n.language === "am" ? "አማርኛ" : "English"}
                  <FiChevronDown className={`transition-transform ${openLang ? 'rotate-180' : ''}`} />
                </button>
                {openLang && (
                  <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <button onClick={() => { i18n.changeLanguage("en"); setOpenLang(false); }} className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800">🇺🇸 English</button>
                    <button onClick={() => { i18n.changeLanguage("am"); setOpenLang(false); }} className="flex items-center gap-3 w-full px-5 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">🇪🇹 አማርኛ</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activePage === "dashboard" && <AdminDashboardContent />}
            {/* Other pages would follow the same pattern */}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------------- ADMIN DASHBOARD CONTENT ---------------- */
function AdminDashboardContent() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRest, setSelectedRest] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint = selectedRest === "ALL"
          ? `${API_URL}/api/orders`
          : `${API_URL}/api/orders/restaurant/${selectedRest}`;

        const [ordersRes, restRes] = await Promise.all([
          axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/restaurants`)
        ]);
        setOrders(ordersRes.data || []);
        setRestaurants(restRes.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedRest, token]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === today);
    const revenue = todayOrders.reduce((sum, o) => sum + (o.adminCommission || 0), 0);
    return {
      totalToday: todayOrders.length,
      revenueToday: revenue,
      pending: todayOrders.filter(o => o.orderStatus === "PENDING").length,
      delivered: todayOrders.filter(o => o.orderStatus === "DELIVERED").length
    };
  }, [orders]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div></div>;

  return (
    <div className="space-y-8">
      {/* RESTAURANT FILTER */}
      <div className="flex justify-end">
        <div className="relative group">
          <FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedRest}
            onChange={(e) => setSelectedRest(e.target.value)}
            className="pl-12 pr-10 py-3 bg-white dark:bg-slate-800 dark:text-white rounded-2xl shadow-sm border-none font-bold text-sm min-w-[250px] appearance-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">{t("allRestaurants")}</option>
            {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("dailyOrders")} value={stats.totalToday} icon={<FiShoppingBag />} color="blue" />
        <StatCard title={t("platformRevenue")} value={`ETB ${stats.revenueToday.toLocaleString()}`} icon={<FiTrendingUp />} color="emerald" />
        <StatCard title={t("pending")} value={stats.pending} icon={<FiClock />} color="orange" />
        <StatCard title={t("successful")} value={stats.delivered} icon={<FiCheckCircle />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title={t("systemOrderStream")} subtitle={t("recentTransactions")}>
            <div className="mt-6 space-y-4">
              {orders.slice(0, 6).map((o) => (
                <div key={o._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                      #{o._id.slice(-4).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm dark:text-white">{o.restaurantId?.name || "Restaurant"}</p>
                      <p className="text-[10px] uppercase font-black text-slate-400">{o.customerName?.firstName} • {new Date(o.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white text-sm">ETB {o.totalPrice}</p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${o.orderStatus === "DELIVERED" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={t("platformPulse")}>
            <div className="space-y-4 mt-4">
              <StatusRow label={t("activeRestaurants")} value={restaurants.length} color="blue" />
              <StatusRow label={t("failedPayments")} value={orders.filter(o => o.paymentStatus === "FAILED").length} color="orange" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- REUSABLE UI COMPONENTS ---------------- */

function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${active ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
      <div className="flex items-center gap-4">
        <span className={`text-xl ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}>{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {badge > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg animate-pulse">{badge}</span>}
    </button>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>{icon}</div>
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h2>
    </div>
  );
}

function Card({ children, title, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
      <h3 className="text-lg font-black tracking-tight dark:text-white uppercase">{title}</h3>
      {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}

function StatusRow({ label, value, color }) {
  const dots = { blue: "bg-blue-500", orange: "bg-orange-500", emerald: "bg-emerald-500" };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dots[color]}`}></div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className="font-black text-lg dark:text-white">{value}</span>
    </div>
  );
}