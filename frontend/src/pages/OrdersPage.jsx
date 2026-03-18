import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Calendar,
  Hash,
  Printer,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Info,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api";

/**
 * OrdersPage Component
 * Updated with Modern E-commerce UI, Framer Motion animations,
 * and Print-ready styling. 
 */
export default function OrdersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // --- Logic states (Maintained as requested) ---
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/sinorders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("We couldn't retrieve your order details. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // --- UI Helper: Formatted Date ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-yellow-500" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Processing order data...</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 text-center">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-10">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="text-red-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {/* <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"
          >
            Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  if (!order) return null;

  // --- Calculation Logic (Maintained) ---
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = order.totalPrice - subtotal;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 font-sans pb-20 selection:bg-yellow-100">

      {/* 1. TOP NAVIGATION / HEADER (Hidden on Print) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10">

        {/* 2. SUCCESS MESSAGE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Order Confirmed
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Thank you for choosing Maraki Eats. Your order <span className="text-black font-semibold">#{order._id.slice(-5).toUpperCase()}</span> has been placed successfully and is currently being prepared.
          </p>
          {!isLoggedIn && (
            <div className="mt-8 inline-flex items-center gap-3 bg-yellow-400/10 border border-yellow-200 px-6 py-3 rounded-2xl text-yellow-800">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold">
                Create an account to track this order & unlock a 10% discount on your next meal!
              </span>
            </div>
          )}
        </motion.div>

        {/* 3. MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Order Items & Payment Details */}
          <div className="lg:col-span-8 space-y-6">

            {/* PROGRESS TRACKER (Modern Addition) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg">Order Status</h3>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {order.status || "Processing"}
                </span>
              </div>
              <div className="flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                <StatusStep active label="Confirmed" />
                <StatusStep active={order.status === "CONFIRMED"} label="Preparing" />
                <StatusStep active={order.status === "PREPARING"} label="On the way" />
                <StatusStep active={order.status === "DELIVERED"} label="Delivered" />
              </div>
            </div>
            {/* ORDER ITEMS CARD */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Package className="text-gray-400" size={20} />
                  Your Items
                </h3>
                <span className="text-sm text-gray-400 font-medium">{order.items.length} Items</span>
              </div>

              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                      <th className="px-8 py-4">Product Details</th>
                      <th className="px-8 py-4 text-center">Qty</th>
                      <th className="px-8 py-4 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors capitalize">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Authentic Taste</p>
                        </td>
                        <td className="px-8 py-6 text-center font-bold text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-gray-900">
                          Br {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY FOOTER */}
              <div className="bg-gray-50/50 p-8 space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900">Br {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Fee</span>
                  <span className="text-gray-900">Br {shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Total Amount</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gray-900">
                      Br {order.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Inclusive of VAT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BANK DETAILS (Logic preserved) */}
            {(order.paymentMethod === "BANK or TELEBIRR" || order.paymentMethod === "COD") && order.paymentStatus !== "PAID" && (
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl shadow-gray-200"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-black">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Payment Instructions</h2>
                    <p className="text-gray-400 text-sm">Please use the details below to complete your transfer</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <BankCard
                    title="Commercial Bank of Ethiopia"
                    account="1000654436097"
                    label="Maraki Eats Food Ordering"
                    color="bg-slate-800"
                  />
                  <BankCard
                    title="TeleBirr"
                    account="0977-91-90-00"
                    label="Fekadu Asafewe"
                    color="bg-slate-800"
                  />
                </div>
                <p className="mt-8 text-xs text-gray-500 italic text-center">
                  * Please include your order number <b>#{order._id.slice(-5).toUpperCase()}</b> as a reference in the bank remark.
                </p>
              </motion.section>
            )}
          </div>

          {/* RIGHT: Customer Sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* ORDER INFO CARD */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Info size={18} className="text-yellow-500" />
                Order Summary
              </h3>

              <div className="space-y-4">
                <InfoRow label="Order ID" value={`#${order._id.slice(-5).toUpperCase()}`} icon={<Hash size={14} />} />
                <InfoRow label="Date" value={formatDate(order.createdAt)} icon={<Calendar size={14} />} />
                <InfoRow label="Method" value={order.paymentMethod === "BANK" ? "Transfer" : order.paymentMethod} icon={<CreditCard size={14} />} />
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                Delivery Information
              </h3>

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="font-bold text-gray-900 text-base capitalize mb-1">
                    {order.customerName.firstName} {order.customerName.lastName}
                  </p>
                  <p className="text-gray-500 leading-relaxed capitalize">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-gray-600 px-2">
                  <Phone size={14} />
                  <span className="font-medium">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 px-2">
                  <Mail size={14} />
                  <span className="font-medium truncate">{order.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">Special notes</h3>
              <div className="p-4 bg-yellow-50/50 border border-yelstructionslow-100 rounded-2xl">
                <p className="text-sm text-yellow-900 italic leading-relaxed">
                  {order.instructions || "No specific instructions provided."}
                </p>
              </div>
            </div>

            {/* HELP CARD */}
            <div className="p-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-3xl text-black shadow-lg shadow-yellow-100 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-black text-xl mb-2">Need Help?</h4>
                <p className="text-sm font-medium opacity-80 mb-6">If you have any issues with your delivery, contact us 24/7.</p>
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform">
                  Contact Support
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-black/5 p-8 rounded-full group-hover:scale-110 transition-transform">
                <Phone size={80} />
              </div>
            </div>

          </aside>
        </div>
      </main>

      {/* FOOTER BRANDS (Optional visual flair) */}
      <footer className="mt-20 border-t border-gray-100 pt-10 text-center print:hidden">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
          Maraki Eats &bull; Food Ordering System
        </p>
      </footer>
    </div>
  );
}

/**
 * Sub-Component: BankCard
 */
function BankCard({ title, account, label, color }) {
  return (
    <div className={`${color} p-5 rounded-2xl border border-white/5 relative group`}>
      <p className="text-[10px] uppercase font-black text-yellow-400 tracking-wider mb-1">{title}</p>
      <p className="text-lg font-mono font-bold tracking-wider mb-4 select-all cursor-pointer">
        {account}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400 font-medium">{label}</span>
        <ExternalLink size={12} className="text-gray-500 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}

/**
 * Sub-Component: InfoRow
 */
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

/**
 * Sub-Component: StatusStep
 */
function StatusStep({ active, label }) {
  return (
    <div className="flex flex-col items-center gap-3 relative z-10">
      <div className={`w-6 h-6 rounded-full border-4 ${active ? 'bg-yellow-500 border-yellow-100' : 'bg-gray-200 border-white'}`}></div>
      <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}