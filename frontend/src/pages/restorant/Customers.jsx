import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiShoppingBag, FiCreditCard, FiClock, FiMail } from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantId = storedUser?.restaurant?.restaurantId;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/customers/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomers(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setLoading(false);
    }
  };

  // Helper for Date Formatting: "July 10, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return "No orders yet";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Helper to determine Status Dot Color (Logic Preserved)
  const getStatusColor = (lastOrderDate) => {
    if (!lastOrderDate) return "bg-gray-400";

    const lastOrder = new Date(lastOrderDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastOrder);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90) return "bg-red-500";
    if (diffDays > 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
            <FiUsers className="text-indigo-600 dark:text-indigo-400" /> Customer Insights
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Monitor patron activity and retention status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
            <span className="text-indigo-700 dark:text-indigo-300 font-bold text-lg">{customers.length}</span>
            <span className="text-indigo-600 dark:text-indigo-400 text-sm ml-2 font-medium">Total Customers</span>
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-6 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active (&lt;40d)</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Slipping (40d+)</div>
        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Inactive (90d+)</div>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 dark:text-slate-500 font-medium">Analyzing customer retention...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
          <FiUsers className="mx-auto w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-300">No customers found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* TABLE HEADER */}
          <div className="hidden md:grid grid-cols-12 px-8 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            <div className="col-span-5">Customer Info</div>
            <div className="col-span-2 text-center">Orders</div>
            <div className="col-span-2 text-center">Total Spent</div>
            <div className="col-span-3 text-right">Last Activity</div>
          </div>

          {customers.map((customer, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">

                {/* CUSTOMER INFO & DYNAMIC STATUS */}
                <div className="md:col-span-5 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    {customer.profileImage ? (
                      <img
                        src={`${API_URL}${customer.profileImage}`}
                        alt="profile"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-800 border border-gray-100 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center font-bold text-white text-xl shadow-inner">
                        {customer.fullname?.charAt(0)}
                      </div>
                    )}
                    {/* DYNAMIC STATUS DOT */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full shadow-sm ${getStatusColor(customer.lastOrder)}`}></div>
                  </div>

                  <div className="overflow-hidden">
                    <div className="font-bold text-gray-900 dark:text-white truncate text-lg leading-tight">
                      {customer.fullname}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <FiMail className="flex-shrink-0" />
                      <span className="truncate">{customer.email || "Guest User"}</span>
                    </div>
                  </div>
                </div>

                {/* ORDER STATS */}
                <div className="md:col-span-2 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-slate-200 font-bold">
                    <FiShoppingBag className="text-gray-400 dark:text-slate-500" />
                    {customer.totalOrders}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-600 mt-1 tracking-widest">Orders</div>
                </div>

                <div className="md:col-span-2 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <FiCreditCard />
                    {customer.totalSpent?.toLocaleString()} ETB
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-600 mt-1 tracking-widest">Total Spent</div>
                </div>

                {/* LAST ORDER DATE */}
                <div className="md:col-span-3 flex flex-col items-end">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium text-sm">
                    <FiClock className="text-gray-400 dark:text-slate-500" />
                    {formatDate(customer.lastOrder)}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-600 mt-1 tracking-widest">
                    Last Order
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}