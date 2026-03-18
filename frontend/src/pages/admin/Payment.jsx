import React, { useState, useMemo } from "react";
import {
  FiDollarSign,
  FiPieChart,
  FiTruck,
  FiCreditCard,
  FiFilter,
  FiDownload,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiUser
} from "react-icons/fi";

/**
 * ENUM TYPES:
 * Payment Methods: ["BANK or TELEBIRR", "CHAPA", "COD"]
 * Time Filters: ["All Time", "Today", "Weekly"]
 */

const DUMMY_PAYMENTS = [
  {
    _id: "TXN-9901",
    orderId: "ORD-7701",
    restaurant: "Skyline Burger",
    customer: "Abebe Kebede",
    amount: 1250,
    paymentMethod: "BANK or TELEBIRR",
    status: "Settled",
    date: new Date().toISOString(),
    commissionRate: 0.1,
  },
  {
    _id: "TXN-9902",
    orderId: "ORD-7702",
    restaurant: "Pizza Hut",
    customer: "Sara Tekle",
    amount: 850,
    paymentMethod: "COD",
    status: "Pending Collection",
    date: new Date().toISOString(),
    commissionRate: 0.12,
  },
  {
    _id: "TXN-9903",
    orderId: "ORD-7703",
    restaurant: "Habesha Kitchen",
    customer: "Dawit Isaac",
    amount: 3200,
    paymentMethod: "CHAPA",
    status: "Settled",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    commissionRate: 0.1,
  },
  {
    _id: "TXN-9904",
    orderId: "ORD-7704",
    restaurant: "Skyline Burger",
    customer: "Muna Ahmed",
    amount: 450,
    paymentMethod: "BANK or TELEBIRR",
    status: "Settled",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    commissionRate: 0.1,
  },
  {
    _id: "TXN-9905",
    orderId: "ORD-7705",
    restaurant: "Burger King",
    customer: "Samuel L.",
    amount: 1100,
    paymentMethod: "COD",
    status: "Collected",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    commissionRate: 0.15,
  },
  {
    _id: "TXN-9906",
    orderId: "ORD-7706",
    restaurant: "Lucy Hotel",
    customer: "Helen G.",
    amount: 5400,
    paymentMethod: "CHAPA",
    status: "Settled",
    date: new Date().toISOString(),
    commissionRate: 0.08,
  }
];

export default function Payments() {
  const [payments] = useState(DUMMY_PAYMENTS);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [restaurantFilter, setRestaurantFilter] = useState("All Restaurants");

  // Generate dynamic list of restaurants from data
  const restaurantOptions = useMemo(() => {
    const names = payments.map(p => p.restaurant);
    return ["All Restaurants", ...new Set(names)];
  }, [payments]);

  // --- Multi-Layer Filtering Logic ---
  const filteredData = useMemo(() => {
    return payments.filter((p) => {
      const pDate = new Date(p.date);
      const now = new Date();

      // 1. Time Filter
      let matchesTime = true;
      if (timeFilter === "Today") {
        matchesTime = pDate.toDateString() === now.toDateString();
      } else if (timeFilter === "Weekly") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesTime = pDate >= oneWeekAgo;
      }

      // 2. Search (ID or Customer)
      const matchesSearch =
        p.customer.toLowerCase().includes(search.toLowerCase()) ||
        p.orderId.toLowerCase().includes(search.toLowerCase());

      // 3. Method Filter
      const matchesMethod = methodFilter === "All" || p.paymentMethod === methodFilter;

      // 4. Restaurant Filter
      const matchesRestaurant = restaurantFilter === "All Restaurants" || p.restaurant === restaurantFilter;

      return matchesTime && matchesSearch && matchesMethod && matchesRestaurant;
    });
  }, [payments, search, methodFilter, timeFilter, restaurantFilter]);

  // --- Financial Aggregations ---
  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCommission = filteredData.reduce((acc, curr) => acc + (curr.amount * curr.commissionRate), 0);

    // Digital = BANK/TELEBIRR + CHAPA
    const digitalTotal = filteredData
      .filter(p => p.paymentMethod !== "COD")
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Physical = COD
    const codTotal = filteredData
      .filter(p => p.paymentMethod === "COD")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { totalRevenue, totalCommission, digitalTotal, codTotal };
  }, [filteredData]);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 px-4 md:px-8 py-10">

      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-600 text-white p-1 rounded-md"><FiActivity size={14} /></span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Global Finance Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Financial Control</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {restaurantFilter === "All Restaurants" ? "Viewing all partner performance" : `Showing records for ${restaurantFilter}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            {["All Time", "Today", "Weekly"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeFilter === t
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Gross Volume" value={`${stats.totalRevenue.toLocaleString()} ETB`} icon={<FiDollarSign />} color="indigo" growth="+12%" />
        <StatCard title="Total Comm." value={`${stats.totalCommission.toLocaleString()} ETB`} icon={<FiPieChart />} color="emerald" growth="Earned" />
        <StatCard title="Digital Pay" value={`${stats.digitalTotal.toLocaleString()} ETB`} icon={<FiCreditCard />} color="blue" growth="Auto-Settle" />
        <StatCard title="COD Pending" value={`${stats.codTotal.toLocaleString()} ETB`} icon={<FiTruck />} color="amber" growth="Manual Rec." />
      </div>

      {/* 3. MULTI-FILTER BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        {/* Search */}
        <div className="lg:col-span-4 relative group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID or Client..."
            className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Restaurant Filter */}
        <div className="lg:col-span-4 relative">
          <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" />
          <select
            className="w-full pl-14 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none appearance-none font-bold text-sm cursor-pointer"
            value={restaurantFilter}
            onChange={(e) => setRestaurantFilter(e.target.value)}
          >
            {restaurantOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Method Filter */}
        <div className="lg:col-span-4 relative">
          <FiCreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-14 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none appearance-none font-bold text-sm cursor-pointer"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Payment Methods</option>
            <option value="BANK or TELEBIRR">BANK or TELEBIRR</option>
            <option value="CHAPA">CHAPA</option>
            <option value="COD">COD (Cash on Delivery)</option>
          </select>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-6">Reference</th>
                <th className="px-8 py-6">Restaurant</th>
                <th className="px-8 py-6">Order Details</th>
                <th className="px-8 py-6 text-right">Settlement</th>
                <th className="px-8 py-6 text-center">Method</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.length > 0 ? filteredData.map((txn) => {
                const commissionAmt = txn.amount * txn.commissionRate;
                const restaurantNet = txn.amount - commissionAmt;

                return (
                  <tr key={txn._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">#{txn.orderId}</span>
                        <span className="text-[10px] text-slate-400 mt-1"><FiCalendar className="inline mr-1" />{new Date(txn.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {txn.restaurant}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{txn.amount.toLocaleString()} ETB</span>
                        <span className="text-[10px] text-slate-400 italic">By {txn.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">+{commissionAmt.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Payout: {restaurantNet.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${txn.paymentMethod === 'COD'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20'
                          }`}>
                          {txn.paymentMethod === 'COD' ? <FiTruck size={12} /> : <FiCreditCard size={12} />}
                          {txn.paymentMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${txn.status === 'Settled' || txn.status === 'Collected' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                          }`} />
                        <span className="text-[10px] font-black uppercase tracking-tight">{txn.status}</span>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center opacity-30">
                    <FiSearch size={48} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">No matched financial records</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, growth }) {
  const colors = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border-indigo-100 dark:border-indigo-900/30",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/30",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-900/30",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 ${colors[color]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black mt-2 tracking-tighter">{value}</h3>
      <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black mt-4">
        <FiTrendingUp /> {growth}
      </div>
    </div>
  );
}