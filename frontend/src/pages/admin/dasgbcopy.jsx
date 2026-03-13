import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiUsers,
  FiAlertCircle,
  FiLogOut,
  FiShoppingBag,
  FiInstagram,
  FiFileText,
} from "react-icons/fi";
import OrdersPage from "./Orders";
import UsersPage from "./Users";
import RestaurantsPage from "./Restaurant";
import Category from "./Category";
import axios from "axios";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "dashboard";
  });
  const [unseenCount, setUnseenCount] = useState(0);

  // Fetch unseen notifications on load
  useEffect(() => {
    fetchUnseenCount();
  }, []);

  const fetchUnseenCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders/admin/unseen-count",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setUnseenCount(res.data.unseenCount);
    } catch (err) {
      console.error("Error fetching unseen count:", err);
    }
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    localStorage.setItem("activePage", page);

    if (page === "orders") {
      // Mark notifications as seen when opening Orders page
      axios.post(
        "http://localhost:5000/api/orders/admin/mark-seen",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setUnseenCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/";
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-[#1F1F25] text-gray-300 flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <div className="text-xl font-bold text-white">Addis Eats</div>
        </div>

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
            label={`Orders ${unseenCount > 0 ? `(${unseenCount})` : ""}`}
            active={activePage === "orders"}
            onClick={() => handlePageChange("orders")}
          />
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
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
            className="flex items-center gap-2 text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 shadow"
          >
            <FiLogOut />
            Logout
          </button>
        </div>

        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "users" && <UsersPage />}
        {activePage === "restaurants" && <RestaurantsPage />}
        {activePage === "categories" && <Category />}
        {activePage === "orders" && <OrdersPage />}
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded cursor-pointer 
      ${active ? "bg-gray-700 text-white" : "hover:bg-gray-700"}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ---------------- Dashboard Page ---------------- */
function DashboardPage() {
  return (
    <div>
      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-gray-600">Total Orders</div>
          <div className="text-3xl font-bold mt-2">1,245</div>
          <div className="text-green-600 text-sm mt-1">▲ Up this week</div>
        </Card>

        <Card>
          <div className="text-gray-600">Weekly Revenue</div>
          <div className="text-3xl font-bold mt-2">12</div>
          <div className="text-gray-500 mt-1">245,000 ETB</div>
        </Card>

        <Card>
          <div className="text-gray-600">New Registrations</div>
          <div className="text-3xl font-bold mt-2 text-red-500">
            3 High-Risk Orders
          </div>
          <button className="mt-3 text-sm text-white bg-red-500 px-4 py-1 rounded">
            View Details
          </button>
        </Card>
      </div>

      {/* ---------- Analytics & Alerts ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <h2 className="text-gray-700 font-semibold mb-4">
            Platform Analytics
          </h2>
          <p className="text-sm text-gray-500 mb-2">Order Trends by Cuisine</p>
          <div className="flex space-x-6 mt-4">
            <Bar
              title="Traditional"
              bars={[30, 60, 80]}
              colors={["bg-blue-500", "bg-blue-400", "bg-blue-300"]}
            />
            <Bar
              title="Fast Food"
              bars={[40, 70, 120]}
              colors={["bg-green-500", "bg-green-400", "bg-green-300"]}
            />
            <Bar
              title="International"
              bars={[60, 100, 150]}
              colors={["bg-red-500", "bg-red-400", "bg-red-300"]}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-gray-700 font-semibold mb-4">AI Fraud Alerts</h2>
          <p className="text-lg font-bold text-red-500">3 High-Risk Orders</p>
          <button className="mt-3 text-sm bg-red-500 text-white py-1 px-4 rounded">
            Review Restaurants
          </button>

          <div className="mt-6">
            <h3 className="text-gray-600 text-sm mb-2">Recent Activity</h3>
            <AlertItem text="User ‘GWT’ anti-installation" />
            <AlertItem text="User ‘Kidst A.’ reviewed order #2021" />
          </div>
        </Card>
      </div>

      {/* ---------- Restaurant Approvals ---------- */}
      <Card className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-700 font-semibold">
            Pending Restaurant Approvals
          </h2>
          <button className="bg-red-500 text-white px-4 py-1 rounded text-sm">
            Approve / Reject
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Name</th>
              <th>Owner Email</th>
              <th>Date</th>
              <th>Orders</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b text-gray-600">
              <td className="py-3">Lucy Hotel</td>
              <td>admin@lucy.com</td>
              <td>Jan 4</td>
              <td>124</td>
              <td>4.8</td>
            </tr>
            <tr className="border-b text-gray-600">
              <td className="py-3">Kidist Restaurant</td>
              <td>kidist@gmail.com</td>
              <td>Jan 5</td>
              <td>83</td>
              <td>4.5</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- Reusable Components ---------------- */
function Card({ children, className }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}

function Bar({ title, bars, colors }) {
  return (
    <div className="flex flex-col items-center">
      <div className="space-y-1">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`${colors[i]} w-6 rounded`}
            style={{ height: `${height}px` }}
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
      <FiAlertCircle className="text-red-500" />
      {text}
    </div>
  );
}
