import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiStar, FiMapPin, FiArrowRight,
  FiTruck, FiShield, FiClock, FiHeart, FiShoppingBag, FiPlus
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = "https://multi-reataurant-1.onrender.com";

const HERO_COLORS = ["text-orange-500", "text-cyan-400", "text-green-400", "text-yellow-400", "text-purple-400", "text-pink-400"];

const AnimatedWordText = ({ text, className }) => (
  <div className={`flex flex-wrap justify-center gap-x-3 ${className}`}>
    {text.split(" ").map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ delay: i * 0.08, duration: 0.5 }}
        className={HERO_COLORS[i % HERO_COLORS.length]}
      >
        {word}
      </motion.span>
    ))}
  </div>
);

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to listen to URL changes
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);

  /* ---------------- SEARCH LOGIC ---------------- */
  // Extract search term from URL: e.g., /?search=pizza
  const searchQuery = new URLSearchParams(location.search).get("search")?.toLowerCase() || "";

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRest, resMenu] = await Promise.all([
          fetch(`${API_URL}/api/restaurants`),
          fetch(`${API_URL}/api/menu-items`)
        ]);
        const dataRest = await resRest.json();
        const dataMenu = await resMenu.json();
        console.log("datamenu", dataMenu)
        setRestaurants(Array.isArray(dataRest) ? dataRest : []);
        setMenuItems(Array.isArray(dataMenu) ? dataMenu : []);

        setLoadingRecs(true);
        const recPath = token
          ? `${API_URL}/api/recommendations/user-recommendations`
          : `${API_URL}/api/recommendations/guest-recommendations`;

        const recRes = await axios.get(recPath, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setRecommendations(recRes.data);
        setLoadingRecs(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoadingRecs(false);
      }
    };
    fetchData();
  }, [token]);

  /* ---------------- FILTERING LOGIC ---------------- */
  // Filter recommendations based on search query
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery) return recommendations;
    return recommendations.filter(item =>
      item.name?.toLowerCase().includes(searchQuery) ||
      item.category?.toLowerCase().includes(searchQuery) ||
      item.restaurantId?.name?.toLowerCase().includes(searchQuery)
    );
  }, [recommendations, searchQuery]);

  // Filter cuisine categories based on search query
  /* ---------------- CUISINE GROUPING LOGIC ---------------- */
  const filteredCuisineMenus = useMemo(() => {
    if (!menuItems.length) return [];

    const categoryMap = new Map();

    menuItems.forEach((item) => {
      const catObj = item.categoryId;

      // Only process if the category object exists
      if (catObj && catObj._id) {
        // We use the category ID as the key to ensure uniqueness per category
        if (!categoryMap.has(catObj._id)) {
          categoryMap.set(catObj._id, {
            image: item.image,
            itemName: item.name, // The specific menu item name
            categoryName: catObj.label || catObj.name || catObj.key, // The category name/label
            restaurantId: item.restaurantId?._id || item.restaurantId
          });
        }
      }
    });

    return Array.from(categoryMap.values()).slice(0, 8);
  }, [menuItems]);

  /* ---------------- CART ACTION ---------------- */
  const handleQuickAdd = (item) => {
    const imageUrl = item.image
      ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`)
      : "/placeholder.jpg";

    const itemToCart = {
      ...item,
      menuItemId: item._id,
      image: imageUrl,
    };
    const restaurantId = item.restaurantId?._id || item.restaurantId;

    addToCart(itemToCart, restaurantId);
    navigate("/cart");
  };

  /* ---------------- HERO SLIDER ---------------- */
  const heroImages = [
    { image: "/image/img1.jpg", label: "Gourmet Experience" },
    { image: "/image/img2.jpg", label: "Local Excellence" },
    { image: "/image/img3.jpg", label: "Fast & Fresh" },
  ];

  const heroTexts = [
    { title: "Savor the Flavors of Addis", subtitle: "Handpicked dishes from the city's top-rated kitchens." },
    { title: "Gourmet Meals, Rapid Delivery", subtitle: "Your favorite food, delivered to your doorstep in minutes." },
    { title: "Experience Culinary Excellence", subtitle: "Explore Top Restaurants Now" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="w-full bg-[#FCFCFD] dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">

      {/* OVERLAY DROPDOWN LOGIC */}
      <div className="relative z-[100] max-w-[1440px] mx-auto px-6 md:px-16 pt-8 md:pt-12 flex justify-center lg:justify-end">
        <div className="relative inline-block">
          <button
            onClick={() => setShowRestaurants(!showRestaurants)}
            className={`flex items-center gap-4 px-6 py-4 rounded-[24px] shadow-2xl transition-all duration-300 active:scale-95 
            ${showRestaurants
                ? 'bg-slate-900 text-white dark:bg-orange-600'
                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-orange-50 dark:hover:bg-slate-700'
              }`}
          >
            <div className={`p-2 rounded-xl ${showRestaurants ? 'bg-orange-500 text-white' : 'bg-orange-100 dark:bg-slate-700 text-orange-600'}`}>
              <FiShoppingBag size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                {t("activeHubs")}
              </p>
              <p className="font-black text-sm">
                {t("selectRestaurant")}
              </p>
            </div>
            <div className="ml-4 opacity-30">
              {showRestaurants ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </button>

          {showRestaurants && (
            <div className="absolute top-full mt-4 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-0 w-[300px] md:w-[380px] bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="font-black text-slate-800 dark:text-slate-200 text-xs uppercase tracking-widest">Available Partners</h4>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
              </div>

              <div className="max-h-[350px] md:max-h-[450px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                {restaurants.length > 0 ? (
                  restaurants.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => {
                        navigate(`/restaurant/${r._id}`);
                        setShowRestaurants(false);
                      }}
                      className="flex items-center gap-4 p-5 hover:bg-orange-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group border-b border-gray-50 dark:border-slate-800 last:border-0"
                    >
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-black text-slate-800 dark:text-slate-200 group-hover:text-orange-600 transition-colors truncate">{r.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate">
                          {r.address?.street || r.address?.city || 'Addis Ababa'}
                        </p>
                      </div>
                      <FiArrowRight className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-orange-500 shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Loading Hubs...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-12 md:space-y-24 -mt-20 md:-mt-32">

        {/* ======== 1. IMMERSIVE HERO SECTION ======== */}
        {/* ======== 1. IMMERSIVE HERO SECTION (UPDATED) ======== */}
        <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <img
                src={heroImages[heroIndex].image}
                alt="Hero"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-slate-950" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
            <motion.div
              key={`content-${heroIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-5xl"
            >
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white font-black tracking-[0.4em] uppercase text-[10px] md:text-xs mb-8"
              >
                {t("premiumDelivery")}
              </motion.p>

              {/* Modern Multi-color Title */}
              <AnimatedWordText
                text={heroTexts[heroIndex].title}
                className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tighter mb-8 uppercase"
              />

              {/* Modern Multi-color Subtitle */}
              <AnimatedWordText
                text={heroTexts[heroIndex].subtitle}
                className="text-lg md:text-2xl font-bold max-w-2xl mx-auto opacity-90"
              />

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex gap-4 justify-center"
              >
                <button className="group relative bg-orange-600 px-10 py-4 rounded-full font-black uppercase tracking-widest text-white overflow-hidden transition-all hover:scale-105 active:scale-95">
                  <span className="relative z-10">Order Now</span>
                  <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroImages.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === heroIndex ? 48 : 12,
                  backgroundColor: i === heroIndex ? "#F97316" : "rgba(255,255,255,0.3)"
                }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ======== 2. PERSONALIZED RECOMMENDATIONS ======== */}
        <div className="max-w-full mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 md:mb-16 gap-4">
            <div className="space-y-3">
              <div className="h-1.5 w-16 bg-orange-500 rounded-full" />
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                {searchQuery ? t("searchResults") || "Search Results" : (token ? t("recommendedFoods") : t("popularFoods"))}
              </h2>
              <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">
                {searchQuery ? `${t("showingResultsFor") || "Showing results for"} "${searchQuery}"` : (token ? t("recommendedDesc") : t("popularDesc"))}
              </p>
            </div>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-slate-800 rounded-[40px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map((item) => (
                  <div key={item._id} className="group relative">
                    <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] group-hover:-translate-y-4">
                      <img
                        src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : "/placeholder.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FiStar size={12} fill="currentColor" /> {item.restaurantId?.name || "Premium Dish"}
                        </p>
                        <h3 className="text-xl md:text-2xl font-black leading-tight mb-6 uppercase tracking-tighter">{item.name}</h3>
                        <button
                          onClick={() => handleQuickAdd(item)}
                          className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-white hover:text-green-600 transition-all active:scale-90"
                        >
                          <FiPlus size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">{t("noItemsFound") || "No items found for your search."}</p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* ======== 3. BROWSE BY CUISINE ======== */}
        <div className="bg-slate-900 dark:bg-black py-20 md:py-32 transition-colors duration-500">
          {/* Changed max-w-[1440px] to max-w-full */}
          <div className="max-w-full mx-auto px-6 md:px-12">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-16 uppercase">
              {t("browseCuisine")} <span className="text-orange-500 italic">Cuisine</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {filteredCuisineMenus.length > 0 ? (
                filteredCuisineMenus.map((menu, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer text-center"
                    onClick={() => navigate(`/restaurant/${menu.restaurantId}`)}
                  >
                    {/* Image Container */}
                    <div className="aspect-square rounded-[30px] md:rounded-[50px] overflow-hidden border-4 border-slate-800 transition-all duration-500 group-hover:border-orange-500 mb-6 shadow-2xl">
                      <img
                        src={menu.image?.startsWith('http') ? menu.image : `${API_URL}${menu.image}`}
                        alt={menu.itemName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                      />
                    </div>

                    {/* Category Label (Primary) */}
                    <h3 className="text-lg font-black text-white uppercase group-hover:text-orange-500 transition-colors">
                      {menu.categoryName}
                    </h3>

                    {/* Item Name (Secondary - Added as requested) */}
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 group-hover:text-gray-300">
                      Featured: {menu.itemName}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                  {t("noCategoriesFound") || "No cuisines available at the moment."}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== 4. TRUST SECTION ======== */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <FiTruck />, title: t("fastDelivery"), desc: "Average delivery time of 25 minutes across Addis." },
              { icon: <FiShield />, title: t("securePayments"), desc: "Multi-layered security for all your digital transactions." },
              { icon: <FiClock />, title: t("liveTracking"), desc: "Real-time updates from the kitchen to your doorstep." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 items-start p-8 rounded-[40px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                <div className="text-4xl text-orange-500">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase">{feature.title}</h4>
                  <p className="text-gray-400 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F97316; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
}