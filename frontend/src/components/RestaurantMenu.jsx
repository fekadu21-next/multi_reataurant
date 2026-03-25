import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, Clock, Plus, MapPin,
  ShoppingBag, ThumbsUp, ThumbsDown,
  Search, Share2, ArrowLeft, Award,
  ChevronRight, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000";

export default function RestaurantMenu() {
  const { t } = useTranslation();
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const token = localStorage.getItem("token");

  // --- UI & DATA STATE ---
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // --- REVIEW & RATING STATE ---
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  /* =========================================================
     1. DATA ORCHESTRATION (FETCHING)
     ========================================================= */
  useEffect(() => {
    const fetchFullSuite = async () => {
      try {
        setLoading(true);
        const restRes = await fetch(`${API_URL}/api/restaurants/${restaurantId}`);
        const restData = await restRes.json();
        if (restData.image && !restData.image.startsWith("http")) {
          restData.image = `${API_URL}${restData.image}`;
        }
        setRestaurant(restData);

        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();
        setCategories(catData);
        if (catData.length) setActiveCategory(catData[0]._id);

        const menuRes = await fetch(`${API_URL}/api/menu-items/restaurant/${restaurantId}`);
        const menuData = await menuRes.json();
        setMenuItems(Array.isArray(menuData) ? menuData.map(item => ({
          ...item,
          image: item.image ? `${API_URL}${item.image}` : "",
        })) : []);

        const revRes = await axios.get(`${API_URL}/api/reviews/restaurant/${restaurantId}`);
        const revData = revRes.data || [];
        setReviews(revData);
        if (revData.length) {
          const totalScore = revData.reduce((acc, item) => acc + item.rating, 0);
          setAvgRating((totalScore / revData.length).toFixed(1));
          setTotalReviews(revData.length);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchFullSuite();
  }, [restaurantId]);

  /* =========================================================
     2. FAVORITES MANAGEMENT
     ========================================================= */
  useEffect(() => {
    if (token) fetchFavorites();
  }, [token]);

  const fetchFavorites = () => {
    axios.get(`${API_URL}/api/user/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setFavorites(res.data.favorites || []))
      .catch((err) => console.error(err));
  };

  const isDishFavorite = (itemId) =>
    favorites.some(f => f.type === "dish" && f.dish?._id === itemId && f.restaurant?._id === restaurantId);

  const isRestaurantFavorite = () =>
    favorites.some(f => f.type === "restaurant" && f.restaurant?._id === restaurantId);

  const handleToggleDishFavorite = async (item) => {
    if (!token) return navigate("/login");
    const liked = isDishFavorite(item._id);
    try {
      if (!liked) {
        await axios.post(`${API_URL}/api/user/favorites`,
          { type: "dish", restaurantId, dishId: item._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(`${API_URL}/api/user/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: "dish", restaurantId, dishId: item._id },
        });
      }
      fetchFavorites();
    } catch (e) { console.error("Dish Fav Error", e); }
  };

  const handleToggleRestaurantFavorite = async () => {
    if (!token) return navigate("/login");
    const liked = isRestaurantFavorite();
    try {
      if (!liked) {
        await axios.post(`${API_URL}/api/user/favorites`,
          { type: "restaurant", restaurantId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.delete(`${API_URL}/api/user/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { type: "restaurant", restaurantId },
        });
      }
      fetchFavorites();
    } catch (e) { console.error("Rest Fav Error", e); }
  };

  /* =========================================================
     3. SEARCH & FILTERING
     ========================================================= */
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = item.categoryId?._id === activeCategory;
      if (searchQuery.length > 0) return matchesSearch;
      return matchesCategory;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const handleAddToCartAndCheckout = (item) => {
    addToCart(item, restaurantId);
    navigate("/cart");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!restaurant) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mb-4" />
      <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Gathering Ingredients...</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-32 transition-colors duration-500">

      {/* --- HERO SECTION --- */}
      <section className="relative h-[550px] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
          src={restaurant.image}
          className="absolute inset-0 w-full h-full object-cover"
          alt={restaurant.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-black/20 to-transparent">
          <div className="max-w-[1400px] mx-auto h-full flex flex-col justify-between p-8 md:p-16">
            <div className="flex justify-between items-start">
              <button onClick={() => navigate(-1)} className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-2xl rounded-3xl text-white hover:bg-orange-500 transition-all border border-white/30">
                <ArrowLeft size={24} />
              </button>
              <button className="p-4 bg-white/20 dark:bg-black/20 backdrop-blur-2xl rounded-3xl text-white border border-white/30 hover:bg-white/40 dark:hover:bg-white/10">
                <Share2 size={24} />
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-2 bg-orange-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                    <Award size={14} /> {t("popularChoice")}
                  </span>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full text-white">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-black">{avgRating || "4.5"}</span>
                    <span className="text-[10px] text-white/60 font-bold uppercase">({totalReviews} Reviews)</span>
                  </div>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{restaurant.name}</h1>
                <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-white/80 font-bold text-xs uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> 20-30 Mins</span>
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> {restaurant.location || "Addis Ababa"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!isRestaurantFavorite() ? (
                  <button onClick={handleToggleRestaurantFavorite} className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-10 py-5 rounded-[2.5rem] font-black hover:bg-orange-500 dark:hover:bg-orange-50 transition-all active:scale-95 shadow-2xl uppercase tracking-widest text-sm">
                    <ThumbsUp size={20} /> Like Restaurant
                  </button>
                ) : (
                  <button onClick={handleToggleRestaurantFavorite} className="flex items-center gap-3 bg-red-500 text-white px-10 py-5 rounded-[2.5rem] font-black hover:bg-red-600 transition-all active:scale-95 shadow-2xl uppercase tracking-widest text-sm">
                    <ThumbsDown size={20} /> Dislike
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEARCH & CATEGORY BAR --- */}
      <div className={`sticky top-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl py-4 shadow-xl border-b border-gray-100 dark:border-slate-800" : "bg-white dark:bg-slate-950 py-10"}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row gap-8 items-center">
          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t("searchPlaceholderr")}
              className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-orange-500/20 focus:bg-white dark:focus:bg-slate-800 rounded-[2rem] py-5 pl-14 pr-6 font-bold text-gray-800 dark:text-gray-100 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setActiveCategory(cat._id); setSearchQuery(""); }}
                className={`whitespace-nowrap px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${activeCategory === cat._id && searchQuery === ""
                  ? "bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white shadow-lg shadow-gray-200 dark:shadow-none"
                  : "bg-transparent text-gray-400 border-gray-100 dark:border-slate-800 hover:border-gray-900 dark:hover:border-white hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- MENU SECTION --- */}
      <main className="max-w-[1400px] mx-auto px-6 mt-16">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
              {searchQuery ? t("searchResults") : t("chefsSpecials")}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 font-bold mt-1 text-xs uppercase tracking-[0.2em]">
              {t("preparedFresh")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-500/10 px-6 py-3 rounded-2xl border border-orange-100 dark:border-orange-500/20">
            <Flame size={18} className="text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest"> {filteredItems.length} {t("available")}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-50 dark:bg-slate-900 h-[400px] rounded-[3rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const dishLiked = isDishFavorite(item._id);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    key={item._id}
                    className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[3.5rem] border border-gray-50 dark:border-slate-800 p-4 hover:shadow-2xl dark:hover:shadow-orange-500/5 transition-all duration-500"
                  >
                    <div className="relative h-72 w-full overflow-hidden rounded-[2.8rem] mb-6 shadow-xl">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={item.name}
                      />
                      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCartAndCheckout(item)}
                          className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-gray-900 dark:hover:bg-white dark:hover:text-black transition-all active:scale-90"
                        >
                          <Plus size={24} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleToggleDishFavorite(item)}
                          className={`p-4 rounded-2xl shadow-2xl transition-all active:scale-90 ${dishLiked ? "bg-red-500 text-white" : "bg-white/90 dark:bg-slate-800 text-gray-400 hover:text-red-500"}`}
                        >
                          {dishLiked ? <ThumbsDown size={20} /> : <ThumbsUp size={20} />}
                        </button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl text-gray-900 dark:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                          {item.price} ETB
                        </span>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <h3 className="font-black text-gray-900 dark:text-white text-xl leading-tight mb-2 uppercase tracking-tight group-hover:text-orange-600 transition-colors">{item.name}</h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed line-clamp-2 mb-6">
                        {item.description || "A delicious house specialty made with the finest seasonal ingredients."}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          <Clock size={12} /> 15m {t("minsPrep")}
                        </div>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] font-black uppercase">Top Rated</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- REVIEWS SECTION --- */}
      <section className="max-w-[1400px] mx-auto px-6 mt-40 pt-32 border-t border-gray-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div>
            <h2 className="text-2xl font-bold tracking-tighter text-gray-700 dark:text-gray-300 uppercase">
              {t("realFeedbacks")}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mt-2 font-bold text-lg italic tracking-wide">
              {t("feedbackQuote")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div key={r._id} className="bg-gray-50 dark:bg-slate-900 p-10 rounded-[3rem] border border-transparent hover:border-orange-200 dark:hover:border-orange-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={r.userId?.profileImage ? `${API_URL}${r.userId.profileImage}` : "/default-avatar.png"}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                  alt="Reviewer"
                />
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-lg">{r.userId?.fullname || "Verified Guest"}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "#f59e0b" : "none"} className={i < r.rating ? "text-yellow-500" : "text-gray-200 dark:text-slate-700"} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic text-lg">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- QUICK ACTION OVERLAY (CART) --- */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[101] w-full max-w-sm px-6"
          >
            {/* <button
              onClick={() => navigate("/cart")}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-black p-6 rounded-[2.5rem] shadow-3xl flex items-center justify-between hover:scale-105 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <span className="font-black uppercase tracking-widest text-xs">Complete Order</span>
              </div>
              <ChevronRight size={20} />
            </button> */}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}