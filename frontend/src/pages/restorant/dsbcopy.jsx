import React, { useState } from "react";
import {
  FiHome,
  FiShoppingBag,
  FiClipboard,
  FiUsers,
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiAlertCircle,
  FiStar,
} from "react-icons/fi";
import Menu from "./Menu";
import Orders from "./Orders"; // ✅ NEW

export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="w-64 bg-[#1F1F25] text-gray-300 flex flex-col">
        <div className="p-6 text-xl font-bold text-white">Owner Panel</div>

        <nav className="flex-1 space-y-2 px-4">
          <SidebarItem
            icon={<FiHome />}
            label="Dashboard"
            active={activePage === "dashboard"}
            onClick={() => setActivePage("dashboard")}
          />
          <SidebarItem
            icon={<FiShoppingBag />}
            label="Menu Items"
            active={activePage === "menu"}
            onClick={() => setActivePage("menu")}
          />
          <SidebarItem
            icon={<FiClipboard />}
            label="Orders"
            active={activePage === "orders"}
            onClick={() => setActivePage("orders")}
          />

          <SidebarItem icon={<FiUsers />} label="Customers" />
          <SidebarItem icon={<FiBarChart />} label="Sales Analytics" />
          <SidebarItem icon={<FiStar />} label="Reviews" />
          <SidebarItem icon={<FiSettings />} label="Settings" />
        </nav>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold mb-6">
            {activePage === "dashboard" && "Restaurant Overview"}
            {activePage === "menu" && "Menu Items"}
            {activePage === "orders" && "Orders"}
          </h1>

          <div
            onClick={handleLogout}
            className="px-4 py-3 m-4 flex items-center gap-2 bg-red-600 text-white rounded cursor-pointer"
          >
            <FiLogOut /> Logout
          </div>
        </div>
        {activePage === "dashboard" && <DashboardContent />}
        {activePage === "menu" && <Menu />}
        {activePage === "orders" && <Orders />} {/* ✅ */}
      </main>
    </div>
  );
}
/* ---------------- DASHBOARD CONTENT ---------------- */

function DashboardContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-gray-600">Today Orders</div>
          <div className="text-3xl font-bold mt-2">84</div>
        </Card>
        <Card>
          <div className="text-gray-600">Daily Revenue</div>
          <div className="text-3xl font-bold mt-2">12,450 ETB</div>
        </Card>

        <Card>
          <div className="text-gray-600">Pending Reviews</div>
          <div className="text-3xl font-bold mt-2 text-yellow-500">
            6 Reviews
          </div>
        </Card>
      </div>
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

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

function Card({ children, className }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}
