import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiAlertCircle,
  FiLogOut,
  FiShoppingBag,
  FiFileText,
} from "react-icons/fi";
import axios from "axios";
import { io } from "socket.io-client";

import OrdersPage from "./Orders";
import UsersPage from "./Users";
import RestaurantsPage from "./Restaurant";
import Category from "./Category";

const SOCKET_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState(
    localStorage.getItem("activePage") || "dashboard"
  );
  const [unseenCount, setUnseenCount] = useState(0);

  // ---------------- SOCKET LOGIC ----------------
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    const adminId = localStorage.getItem("adminId");

    if (adminId) {
      socket.emit("registerAdmin", adminId);
      console.log("Admin registered:", adminId);
    }

    socket.on("adminNewOrder", () => {
      console.log("New order received (admin)");
      setUnseenCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  // ---------------- FETCH UNSEEN ----------------
  const fetchUnseenCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/admin/unseen-count",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUnseenCount(res.data.unseenCount);
    } catch (err) {
      console.error("Error fetching unseen count", err);
    }
  };

  useEffect(() => {
    fetchUnseenCount();
  }, []);

  // ---------------- PAGE SWITCH ----------------
  const handlePageChange = async (page) => {
    setActivePage(page);
    localStorage.setItem("activePage", page);

    if (page === "orders") {
      try {
        await axios.post(
          "http://localhost:5000/api/orders/admin/mark-seen",
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUnseenCount(0);
        } catch (err) {
        console.error("Error marking seen", err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 bg-[#1F1F25] text-gray-300 flex flex-col">
        <div className="p-6 text-xl font-bold text-white">Addis Eats Admin</div>

        <nav className="flex-1 space-y-2 px-4">
          <SidebarItem
            icon={<FiHome />}
            label="Dashboard"
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
            icon={<FiShoppingBag />}
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
        </nav>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header Section with Logout on the Right */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {activePage === "dashboard" && "Admin Overview"}
            {activePage === "users" && "User Management"}
            {activePage === "restaurants" && "Restaurant Management"}
            {activePage === "categories" && "Category Management"}
            {activePage === "orders" && "Orders Management"}
          </h1>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 shadow transition-colors"
          >
            <FiLogOut />
            Logout
          </button>
        </div>

        {/* Dynamic Pages */}
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "users" && <UsersPage />}
        {activePage === "restaurants" && <RestaurantsPage />}
        {activePage === "categories" && <Category />}
        {activePage === "orders" && <OrdersPage />}
      </main>
    </div>
  );
}

/* ---------------- Dashboard Page (Dummy Content) ---------------- */
function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-gray-600">Total Orders</div>
          <div className="text-3xl font-bold mt-2">1,245</div>
          <div className="text-green-600 text-sm mt-1">▲ Up this week</div>
        </Card>

        <Card>
          <div className="text-gray-600">Weekly Revenue</div>
          <div className="text-3xl font-bold mt-2">245,000 ETB</div>
          <div className="text-gray-500 text-sm mt-1">Total platform earnings</div>
        </Card>

        <Card>
          <div className="text-gray-600">Risk Alerts</div>
          <div className="text-3xl font-bold mt-2 text-red-500">
            3 High-Risk
          </div>
          <button className="mt-3 text-sm text-white bg-red-500 px-4 py-1 rounded hover:bg-red-600">
            Review Now
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <h2 className="text-gray-700 font-semibold mb-4">Platform Analytics</h2>
          <div className="flex space-x-6 mt-4">
            <Bar title="Tradit." bars={[30, 60, 80]} colors={["bg-blue-500", "bg-blue-400", "bg-blue-300"]} />
            <Bar title="Fast F." bars={[40, 70, 120]} colors={["bg-green-500", "bg-green-400", "bg-green-300"]} />
            <Bar title="Intl." bars={[60, 100, 150]} colors={["bg-red-500", "bg-red-400", "bg-red-300"]} />
          </div>
        </Card>

        <Card>
          <h2 className="text-gray-700 font-semibold mb-4">Recent System Logs</h2>
          <div className="mt-4">
            <AlertItem text="New restaurant 'Lucy Hotel' registered" />
            <AlertItem text="User feedback received for order #2021" />
            <AlertItem text="Server maintenance scheduled for 2 AM" />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */
function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded cursor-pointer transition-colors 
      ${active ? "bg-gray-700 text-white" : "hover:bg-gray-700"}`}
    >
      <span className="text-lg relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-0 -right-22 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function Bar({ title, bars, colors }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1 h-20">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`${colors[i]} w-4 rounded-t`}
            style={{ height: `${height / 2}px` }}
          ></div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">{title}</p>
    </div>
  );
}

function AlertItem({ text }) {
  return (
    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
      <FiAlertCircle className="text-blue-500" />
      {text}
    </div>
  );
}