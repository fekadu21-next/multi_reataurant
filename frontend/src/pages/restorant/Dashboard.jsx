import React, { useState, useEffect, useContext } from "react";
import {
  FiHome,
  FiShoppingBag,
  FiClipboard,
  FiUsers,
  FiBarChart,
  FiLogOut,
  FiStar,
  FiMoon,
  FiSun,
  FiClock,
  FiTrendingUp,
  FiAlertTriangle,
  FiGlobe,
  FiChevronDown,
  FiUser,
  FiBriefcase,
  FiMenu,
  FiX,
} from "react-icons/fi";
import axios from "axios";
import Menu from "./Menu";
import Orders from "./Orders";
import Reviews from "./Reviews";
import Customers from "./Customers";
import RestaurantSettings from "./RestaurantSettings";
import ProfileSettings from "./Myprofile";
import SalesAnalytics from "./SalesAnalytics";
import { ThemeContext } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
const API_URL = "http://localhost:5000";
export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("dashboard_active_tab") || "dashboard";
  });
  const [unseenCount, setUnseenCount] = useState(0);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  // Dynamic Restaurant Data
  const restaurantId = storedUser?.restaurant?.restaurantId;
  const restaurantName = storedUser?.restaurant?.name || "My Restaurant";
  const restaurantImage = storedUser?.restaurant?.image; // Assuming image URL is stored here
  const adminName = storedUser?.name || "Admin";
  const [openLang, setOpenLang] = useState(false);
  useEffect(() => {
    localStorage.setItem("dashboard_active_tab", activePage);
  }, [activePage]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("dashboard_active_tab");
    window.location.href = "/";
  };

  useEffect(() => {
    if (!restaurantId) return;
    const fetchUnseen = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/orders/restaurant/${restaurantId}/unseen-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUnseenCount(res.data.unseenCount);
      } catch (err) {
        console.error("Fetch unseen orders failed:", err);
      }
    };
    fetchUnseen();
  }, [restaurantId, token]);

  const navigateTo = (page) => {
    setActivePage(page);
    setIsSidebarOpen(false);
  };
  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300 font-sans relative">
      {/* ---------------- Mobile Overlay ---------------- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Dynamic Restaurant Logo/Icon */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-indigo-100 dark:border-slate-700">
              {restaurantImage ? (
                <img
                  src={`${API_URL}/uploads/${restaurantImage}`}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-black text-xl">
                  {restaurantName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="truncate max-w-[140px]">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none truncate">
                {restaurantName}
              </h1>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Admin Suite</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <FiX size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarItem
            icon={<FiHome />}
            label={t("overview")}
            active={activePage === "dashboard"}
            onClick={() => navigateTo("dashboard")}
          />
          <SidebarItem
            icon={<FiShoppingBag />}
            label={t("menuItems")}
            active={activePage === "menu"}
            onClick={() => navigateTo("menu")}
          />
          <SidebarItem
            icon={<FiClipboard />}
            label={t("orders")}
            active={activePage === "orders"}
            onClick={() => navigateTo("orders")}
            badge={unseenCount}
          />
          <SidebarItem
            icon={<FiUsers />}
            label={t("customers")}
            active={activePage === "customers"}
            onClick={() => navigateTo("customers")}
          />
          <SidebarItem
            icon={<FiBarChart />}
            label={t("salesAnalytics")}
            active={activePage === "sales"}
            onClick={() => navigateTo("sales")}
          />
          <SidebarItem
            icon={<FiStar />}
            label={t("reviews")}
            active={activePage === "reviews"}
            onClick={() => navigateTo("reviews")}
          />

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="px-5 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t("settings")}</p>
            <SidebarItem
              icon={<FiBriefcase />}
              label={t("restaurantSettings")}
              active={activePage === "settings_restaurant"}
              onClick={() => navigateTo("settings_restaurant")}
            />
            <SidebarItem
              icon={<FiUser />}
              label={t("myProfile")}
              active={activePage === "settings_profile"}
              onClick={() => navigateTo("settings_profile")}
            />
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all font-semibold text-sm"
          >
            {darkMode ? (
              <><FiSun /> {t("lightMode")}</>
            ) : (
              <><FiMoon /> {t("nightMode")}</>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
          >
            <FiLogOut />{t("logout")}
          </button>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-4 md:p-8 lg:p-12 overflow-y-auto">

        {/* Mobile Header */}
        <header className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-white shadow-sm"
            >
              <FiMenu size={24} />
            </button>

            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {activePage === "dashboard" && t("dashboardOverview")}
                {activePage === "menu" && t("manageMenu")}
                {activePage === "orders" && t("activeOrders")}
                {activePage === "customers" && t("customerList")}
                {activePage === "sales" && t("revenueAnalytics")}
                {activePage === "reviews" && t("customerFeedback")}
                {activePage === "settings_restaurant" && t("storeSettings")}
                {activePage === "settings_profile" && t("adminProfile")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm mt-1">
                {t("welcomeBack")}, {adminName}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6">
            <div className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-600 dark:text-slate-300"
              >
                <FiGlobe className="text-indigo-600" />
                {i18n.language === "am" ? "አማርኛ" : "English"}
                <FiChevronDown className={`transition-transform duration-300 ${openLang ? 'rotate-180' : ''}`} />
              </button>

              {openLang && (
                <div className="absolute right-0 mt-3 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      localStorage.setItem("lang", "en");
                      setOpenLang(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors border-b border-slate-50 dark:border-slate-800"
                  >
                    <span className="text-base">🇺🇸</span> English
                  </button>
                  <button
                    onClick={() => {
                      i18n.changeLanguage("am");
                      localStorage.setItem("lang", "am");
                      setOpenLang(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors"
                  >
                    <span className="text-base">🇪🇹</span> አማርኛ
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-bold dark:text-white truncate max-w-[120px]">{adminName}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{t("administrator")}</span>
              </div>
              {/* Profile Image / Initials */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 overflow-hidden flex items-center justify-center shadow-sm">
                {restaurantImage ? (
                  <img src={restaurantImage} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-600 font-black">
                    {adminName[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
          {activePage === "dashboard" && <DashboardContent restaurantId={restaurantId} />}
          {activePage === "menu" && <Menu />}
          {activePage === "orders" && <Orders onSeen={() => setUnseenCount(0)} />}
          {activePage === "reviews" && <Reviews />}
          {activePage === "customers" && <Customers />}
          {activePage === "settings_restaurant" && <RestaurantSettings />}
          {activePage === "settings_profile" && <ProfileSettings />}
          {activePage === "sales" && <SalesAnalytics restaurantId={restaurantId} />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- DASHBOARD CONTENT ---------------- */
function DashboardContent({ restaurantId }) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!restaurantId) return;
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/restaurant/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [restaurantId, token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  );

  const today = new Date().toISOString().slice(0, 10);
  const todaysOrders = orders.filter(o => o.createdAt.slice(0, 10) === today);
  const todayRevenue = todaysOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const preparingCount = todaysOrders.filter(o => o.orderStatus === "PREPARING").length;
  const deliveredToday = todaysOrders.filter(o => o.orderStatus === "DELIVERED").length;

  const recentOrders = [...todaysOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("dailyOrders")} value={todaysOrders.length} icon={<FiShoppingBag />} color="blue" />
        <StatCard title={t("todayRevenue")} value={`ETB ${todayRevenue.toLocaleString()}`} icon={<FiTrendingUp />} color="emerald" />
        <StatCard title={t("pending")} value={todaysOrders.filter(o => o.orderStatus === "PENDING").length} icon={<FiClock />} color="orange" />
        <StatCard title={t("successful")} value={deliveredToday} icon={<FiStar />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title={t("orderStream")} subtitle={t("recentTransactions")} >
            <div className="mt-6 space-y-4">
              {recentOrders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium italic">{t("noOrdersToday")}.</p>
                </div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                        #{o._id.slice(-3).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{o.customerName?.firstName} {o.customerName?.lastName}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <p className="font-black text-slate-900 dark:text-white text-sm">ETB {o.totalPrice.toLocaleString()}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${o.orderStatus === "DELIVERED" ? "border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10" :
                        o.orderStatus === "CANCELLED" ? "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-900/10" :
                          "border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-900/10"
                        }`}>
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title={t("kitchenPulse")}>
            <div className="space-y-4 mt-4">
              <StatusRow label={t("newOrders")} value={todaysOrders.filter(o => !o.isSeen).length} color="blue" />
              <StatusRow label={t("inPreparation")} value={preparingCount} color="orange" />
              <StatusRow label={t("outForDelivery")} value={deliveredToday} color="emerald" />
            </div>
          </Card>
          <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <FiAlertTriangle className="text-amber-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-500">{t("lowStockAlert")}</h4>
            </div>
            <p className="text-sm font-bold text-amber-900/70 dark:text-amber-400/70">Milk, Flour, and Eggs are running low in the inventory.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI ATOMS ---------------- */

function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${active
        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
    >
      <div className="flex items-center gap-4">
        <span className={`text-xl ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}`}>{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest">{title}</p>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h2>
    </div>
  );
}

function Card({ children, title, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full">
      {title && (
        <div className="mb-2">
          <h3 className="text-lg font-black tracking-tight dark:text-white">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function StatusRow({ label, value, color }) {
  const dotColor = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColor[color]}`}></div>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className="font-black text-lg dark:text-white">{value}</span>
    </div>
  );
}