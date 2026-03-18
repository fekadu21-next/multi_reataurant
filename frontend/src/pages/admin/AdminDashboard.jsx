import React, { useState, useEffect, useContext } from "react";
import {
  FiHome,
  FiUsers,
  FiAlertCircle,
  FiLogOut,
  FiShoppingBag,
  FiFileText,
  FiMoon,
  FiSun,
  FiGrid,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa";
import axios from "axios";
import { io } from "socket.io-client";

// Pages
import OrdersPage from "./Orders";
import UsersPage from "./Users";
import RestaurantsPage from "./Restaurant";
import Category from "./Category";
import Payments from "./Payment";

import { ThemeContext } from "../../context/ThemeContext";

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const { darkMode, toggleTheme } = useContext(ThemeContext) || {
    darkMode: false,
    toggleTheme: () => { },
  };

  // --- Logic Fix: Persist active page on refresh ---
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("admin_active_tab") || "dashboard";
  });
  const [unseenCount, setUnseenCount] = useState(0);

  // ---------------- SOCKET LOGIC ----------------
  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    const adminId = localStorage.getItem("adminId");
    if (adminId) socket.emit("registerAdmin", adminId);

    socket.on("adminNewOrder", () => setUnseenCount((prev) => prev + 1));
    return () => socket.disconnect();
  }, []);

  // ---------------- FETCH UNSEEN ----------------
  useEffect(() => {
    const fetchUnseenCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/admin/unseen-count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUnseenCount(res.data.unseenCount);
      } catch (err) {
        console.error("Error fetching unseen count", err);
      }
    };
    fetchUnseenCount();
  }, []);

  // ---------------- PAGE SWITCH LOGIC ----------------
  const handlePageChange = async (page) => {
    setActivePage(page);
    localStorage.setItem("admin_active_tab", page);

    if (page === "orders") {
      try {
        await axios.post(
          `${API_URL}/api/orders/admin/mark-seen`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setUnseenCount(0);
      } catch (err) {
        console.error("Error marking seen", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
    } catch (error) {
      console.log("Logout error:", error);
    }
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-10">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <FiActivity size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tight dark:text-white uppercase">
              Addis<span className="text-indigo-600">Eats</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem
            icon={<FiHome />}
            label="Overview"
            active={activePage === "dashboard"}
            onClick={() => handlePageChange("dashboard")}
          />
          <SidebarItem
            icon={<FiUsers />}
            label="Users"
            active={activePage === "users"}
            onClick={() => handlePageChange("users")}
          />
          <SidebarItem
            icon={<FiShoppingBag />}
            label="Restaurants"
            active={activePage === "restaurants"}
            onClick={() => handlePageChange("restaurants")}
          />
          <SidebarItem
            icon={<FiGrid />}
            label="Categories"
            active={activePage === "categories"}
            onClick={() => handlePageChange("categories")}
          />
          <SidebarItem
            icon={<FiFileText />}
            label="Orders"
            active={activePage === "orders"}
            onClick={() => handlePageChange("orders")}
            badge={unseenCount}
          />
          <SidebarItem
            icon={<FaCreditCard />}
            label="Payments"
            active={activePage === "payment"}
            onClick={() => handlePageChange("payment")}

          />
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all font-semibold text-sm"
          >
            {darkMode ? (
              <><FiSun className="text-yellow-500" /> Light Mode</>
            ) : (
              <><FiMoon className="text-indigo-500" /> Dark Mode</>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 ml-72 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activePage === "dashboard" && "Platform Analytics"}
              {activePage === "users" && "User Base"}
              {activePage === "restaurants" && "Partners"}
              {activePage === "categories" && "Menu Taxonomy"}
              {activePage === "orders" && "System Orders"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
              System Administrator Control Panel
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Addis Central</span>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activePage === "dashboard" && <DashboardPage />}
          {activePage === "users" && <UsersPage />}
          {activePage === "restaurants" && <RestaurantsPage />}
          {activePage === "categories" && <Category />}
          {activePage === "orders" && <OrdersPage />}
          {activePage === "payment" && <Payments />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- DASHBOARD PAGE ---------------- */
function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Orders" value="1,245" icon={<FiFileText />} color="indigo" growth="▲ 12% Up" />
        <StatCard title="Platform Revenue" value="245k ETB" icon={<FiTrendingUp />} color="emerald" growth="Steady" />
        <StatCard title="Risk Alerts" value="3 High" icon={<FiAlertCircle />} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Revenue Stream" subtitle="Category distribution">
          <div className="flex justify-around items-end h-40 mt-6">
            <Bar title="Traditional" height={80} color="bg-indigo-500" />
            <Bar title="Fast Food" height={120} color="bg-emerald-500" />
            <Bar title="International" height={150} color="bg-rose-500" />
            <Bar title="Drinks" height={60} color="bg-amber-500" />
          </div>
        </Card>

        <Card title="System Logs" subtitle="Recent infrastructure events">
          <div className="mt-6 space-y-4">
            <AlertItem text="New restaurant 'Lucy Hotel' registered" type="success" />
            <AlertItem text="User feedback received for order #2021" type="info" />
            <AlertItem text="Database backup completed successfully" type="success" />
            <AlertItem text="Server maintenance scheduled for 2 AM" type="warning" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- REUSABLE ATOMS ---------------- */

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
        <span className="bg-indigo-400 text-white text-[10px] font-black px-2 py-0.5 rounded-lg">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, color, growth }) {
  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h2>
      {growth && <p className={`text-[10px] font-bold mt-2 ${growth.includes('▲') ? 'text-emerald-500' : 'text-slate-400'}`}>{growth}</p>}
    </div>
  );
}

function Card({ children, title, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
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

function Bar({ title, height, color }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${color} w-8 rounded-xl opacity-80 hover:opacity-100 transition-opacity`}
        style={{ height: `${height}px` }}
      ></div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{title}</span>
    </div>
  );
}

function AlertItem({ text, type }) {
  const colors = {
    success: "text-emerald-500 bg-emerald-500",
    info: "text-indigo-500 bg-indigo-500",
    warning: "text-amber-500 bg-amber-500",
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 transition-all hover:translate-x-1">
      <div className={`w-1.5 h-1.5 rounded-full ${colors[type].split(' ')[1]}`}></div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}