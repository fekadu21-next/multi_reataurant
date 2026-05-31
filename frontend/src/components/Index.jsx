import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiStar, FiArrowRight,
  FiTruck, FiShield, FiClock, FiShoppingBag, FiPlus,
  FiSearch, FiCheckCircle, FiCompass, FiMenu, FiBarChart2, FiUsers, FiX
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Import custom standalone partner registration layout
import RegisterRes from "./RegisterRes";

const API_URL = "https://multi-reataurant-1.onrender.com";

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Modal display control state trigger
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  /* ---------------- SEARCH LOGIC ---------------- */
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
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery) return recommendations;
    return recommendations.filter(item =>
      item.name?.toLowerCase().includes(searchQuery) ||
      item.category?.toLowerCase().includes(searchQuery) ||
      item.restaurantId?.name?.toLowerCase().includes(searchQuery)
    );
  }, [recommendations, searchQuery]);

  /* ---------------- CUISINE GROUPING LOGIC ---------------- */
  const filteredCuisineMenus = useMemo(() => {
    if (!menuItems.length) return [];

    const categoryMap = new Map();

    menuItems.forEach((item) => {
      const catObj = item.categoryId;
      if (catObj && catObj._id) {
        if (!categoryMap.has(catObj._id)) {
          categoryMap.set(catObj._id, {
            image: item.image,
            itemName: item.name,
            categoryName: catObj.label || catObj.name || catObj.key,
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
    <div className="w-full bg-[#FCFCFD] dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden relative">

      {/* HEADER CONTROLS UTILITY LINE */}
      <div className="relative z-[100] max-w-[1440px] mx-auto px-6 md:px-16 pt-8 md:pt-12 flex flex-row items-center justify-end">

        {/* ACTIVE RESTAURANT SELECTOR HUB */}
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setShowRestaurants(!showRestaurants)}
            className={`flex items-center gap-4 px-6 py-4 rounded-[24px] shadow-2xl transition-all duration-300 active:scale-95 ${showRestaurants
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

      <section className="space-y-16 md:space-y-28 -mt-20 md:-mt-32">

        {/* ======== 1. IMMERSIVE HERO SECTION ======== */}
        <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${index === heroIndex ? "opacity-100 scale-100 z-0" : "opacity-0 scale-110"
                }`}
            >
              <img src={img.image} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-0 flex flex-col items-center justify-center max-w-[1440px] mx-auto px-6 text-center">
            <div className="overflow-hidden mb-4">
              <p className="text-orange-500 font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-[10px] md:text-xs">
                {t("premiumDelivery")}
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter mb-6 transition-all">
              {heroTexts[heroIndex].title}
            </h1>
            <p className="text-base md:text-xl text-gray-300 max-w-xl font-medium leading-relaxed">
              {heroTexts[heroIndex].subtitle}
            </p>
          </div>
        </div>

        {/* ======== 2. 3-STEP "HOW IT WORKS" UI COMPONENT ======== */}
        <div className="max-w-full mx-auto px-6 md:px-12">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <div className="h-1 w-12 bg-orange-500 rounded-full mx-auto" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              How It Works
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              Get your favorite meals delivered straight to your door in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-gray-100 dark:border-slate-800/80 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.05)] text-center relative transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-8 text-6xl font-black text-gray-100 dark:text-slate-800 select-none transition-colors group-hover:text-orange-500/10">01</div>
              <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110">
                <FiSearch size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tight">Select Restaurant</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed px-2">
                Choose from our handpicked collection of premium certified restaurants and top kitchens active across Addis Ababa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-gray-100 dark:border-slate-800/80 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.05)] text-center relative transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-8 text-6xl font-black text-gray-100 dark:text-slate-800 select-none transition-colors group-hover:text-orange-500/10">02</div>
              <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110">
                <FiCompass size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tight">Browse Menu</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed px-2">
                Explore fully localized authentic cuisines, dynamic cloud kitchen setups, and discover everyday gourmet recommendations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-gray-100 dark:border-slate-800/80 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.05)] text-center relative transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-6 right-8 text-6xl font-black text-gray-100 dark:text-slate-800 select-none transition-colors group-hover:text-orange-500/10">03</div>
              <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110">
                <FiCheckCircle size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-tight">Place Your Order</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed px-2">
                Checkout instantly with multi-layer secure digital payments and track your meal live straight to your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* ======== 3. HIGH-CONVERTING PARTNERSHIP LANDING BANNER WITH INLINE BENEFITS ======== */}
        <div className="max-w-full mx-auto px-6 md:px-12">
          <div className="relative rounded-[40px] overflow-hidden bg-slate-900 text-white p-8 md:p-14 border border-slate-800 shadow-2xl group">

            {/* Ambient Background Accent Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-orange-500/20" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

              {/* Left Column: Context & Feature Benefits Grid */}
              <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-wider">
                  🚀 Self-Service Portal Active
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
                  List Your Kitchen. <br className="hidden sm:block" /> Become a Partner Today!
                </h2>
                <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                  Take full charge of your enterprise growth. Bypass traditional waitlists—our open architecture allows restaurant store managers to instantly register, configure dynamic menus, and start dispatching orders to customers in minutes.
                </p>

                {/* Inline Partner Benefits Showcase Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <FiMenu size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Menu Controls</h4>
                      <p className="text-[11px] text-gray-500">Update items & prices live</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <FiBarChart2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Diagnostics</h4>
                      <p className="text-[11px] text-gray-500">Deep digital sales metrics</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <FiUsers size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">Fleet <Accessss></Accessss></h4>
                      <p className="text-[11px] text-gray-500">Instant courier matching</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Direct Navigation Targets */}
              <div className="w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRegisterModal(true);
                  }}
                  className="w-full lg:w-56 px-8 py-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Register Restaurant Now</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ======== 4. PERSONALIZED RECOMMENDATIONS ======== */}
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
                          type="button"
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

        {/* ======== 5. BROWSE BY CUISINE ======== */}
        <div className="bg-slate-900 dark:bg-black py-20 md:py-32 transition-colors duration-500">
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
                    <div className="aspect-square rounded-[30px] md:rounded-[50px] overflow-hidden border-4 border-slate-800 transition-all duration-500 group-hover:border-orange-500 mb-6 shadow-2xl">
                      <img
                        src={menu.image?.startsWith('http') ? menu.image : `${API_URL}${menu.image}`}
                        alt={menu.itemName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                      />
                    </div>

                    <h3 className="text-lg font-black text-white uppercase group-hover:text-orange-500 transition-colors">
                      {menu.categoryName}
                    </h3>

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

        {/* ======== 6. TRUST SECTION ======== */}
        <div className="max-[1440px] mx-auto px-6 md:px-8 pb-32">
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

      {/* ==================== REGISTER RESTAURANT OVERLAY MODAL HOOK ==================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[150] w-full h-full flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl relative animate-in zoom-in-95 duration-300">

            {/* Modal Layer Header Close Trigger Action */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowRegisterModal(false);
              }}
              className="absolute top-6 right-6 md:right-auto md:left-[36%] z-[160] p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white transition-colors"
            >
              <FiX size={18} />
            </button>

            {/* Render Standalone Imported Component */}
            <RegisterRes onClose={() => setShowRegisterModal(false)} />

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F97316; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
}