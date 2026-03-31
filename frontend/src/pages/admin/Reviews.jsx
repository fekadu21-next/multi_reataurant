import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiStar, FiMessageSquare, FiCalendar, FiTrash2,
  FiMapPin, FiAlertCircle, FiCheckCircle, FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
const API_URL = "http://localhost:5000";

export default function AdminReviews() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/restaurants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(res.data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      }
    };
    fetchRestaurants();
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [selectedRestaurant]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = selectedRestaurant === "ALL"
        ? `${API_URL}/api/reviews/admin/all`
        : `${API_URL}/api/reviews/restaurant/${selectedRestaurant}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/admin/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
      setStatusMsg({ type: "success", text: "Entry purged from database." });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
    } catch (err) {
      setStatusMsg({ type: "error", text: "Authorization failed or server error." });
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* --- TOAST NOTIFICATION --- */}
        <AnimatePresence>
          {statusMsg.text && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`fixed top-10 right-10 z-[100] flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-md border ${statusMsg.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-400"
                : "bg-rose-500/90 text-white border-rose-400"
                }`}
            >
              {statusMsg.type === "success" ? <FiCheckCircle className="text-xl" /> : <FiAlertCircle className="text-xl" />}
              <span className="font-bold tracking-tight">{statusMsg.text}</span>
              <FiX className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setStatusMsg({ text: "" })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              {t("review")}<span className="text-blue-600 dark:text-blue-400 text-glow">{t("Vault")}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide">{t("centralModeration")}</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all rounded-full" />
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 shadow-inner">
              <FiMapPin className="ml-4 text-blue-500" />
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="bg-transparent pl-3 pr-10 py-3 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">{t("allDestinations")}</option>
                {restaurants.map((r) => <option key={r._id} value={r._id} className="dark:bg-slate-900">{r.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- DASHBOARD CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatCard
            label={t("avgSatisfaction")}
            value={avgRating}
            sub={t("outOfStars")}
            icon={<FiStar className="text-amber-400 fill-amber-400" />}
          />
          <StatCard
            label={t("totalSubmissions")}
            value={reviews.length}
            sub={t("verifiedReviews")}
            icon={<FiMessageSquare className="text-blue-500" />}
          />
        </div>

        {/* --- FEED --- */}
        <div className="space-y-8">
          {loading ? (
            <LoadingSkeleton />
          ) : reviews.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  key={review._id}
                  className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group relative overflow-hidden transition-all duration-500 hover:border-blue-500/50"
                >
                  <div className="flex flex-col lg:flex-row gap-8 relative z-10">

                    {/* AVATAR & INFO */}
                    <div className="flex items-start gap-6 shrink-0">
                      <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-lg">
                        <img
                          src={review.userId?.profileImage ? `${API_URL}${review.userId.profileImage}` : `https://ui-avatars.com/api/?background=random&name=${review.userId?.fullname}`}
                          alt="" className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{review.userId?.fullname}</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-500/20">
                            @{review.restaurantId?.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                            <FiCalendar /> {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1 pt-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-800"}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 space-y-6">
                      <div className="text-slate-700 dark:text-slate-300 italic text-xl font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        "{review.comment}"
                      </div>

                      {/* IMAGES */}
                      {review.images?.length > 0 && (
                        <div className="flex gap-4">
                          {review.images.map((img, i) => (
                            <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer shadow-md">
                              <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="lg:self-start">
                      <button
                        onClick={() => { if (window.confirm(t("purgeConfirm"))) handleDelete(review._id) }}
                        className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <FiTrash2 size={22} />
                      </button>
                    </div>
                  </div>

                  {/* GLOW DECORATION */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- REUSABLE UI COMPONENTS --- */

const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center justify-between group transition-all hover:translate-y-[-4px]">
    <div className="space-y-1">
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
      <div className="text-5xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
      <p className="text-xs text-slate-400 font-bold">{sub}</p>
    </div>
    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const LoadingSkeleton = () => {
  const { t } = useTranslation(); // now t is defined
  return (
    <div className="flex flex-col items-center justify-center py-40 space-y-6">
      <div className="w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">
        {t("establishingConnection")}...
      </p>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
    <FiMessageSquare className="mx-auto text-7xl text-slate-200 dark:text-slate-800 mb-6" />
    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{t("noData")}</h3>
    <p className="text-slate-500 font-medium">{t("vaultEmpty")}</p>
  </div>
);