import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiStar, FiMapPin, FiArrowRight,
  FiTruck, FiShield, FiClock, FiHeart, FiShoppingBag, FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // Ensure path is correct
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function Index() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const token = localStorage.getItem("token");

  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [menuItems, setMenuItems] = useState([]); // Fallback/Cuisine data
  const [heroIndex, setHeroIndex] = useState(0);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(true);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Restaurants & Global Menu (for Cuisine section)
        const [resRest, resMenu] = await Promise.all([
          fetch(`${API_URL}/api/restaurants`),
          fetch(`${API_URL}/api/menu-items`)
        ]);
        const dataRest = await resRest.json();
        const dataMenu = await resMenu.json();
        setRestaurants(Array.isArray(dataRest) ? dataRest : []);
        setMenuItems(Array.isArray(dataMenu) ? dataMenu : []);

        // 2. Fetch Personalized Recommendations based on Auth Status
        setLoadingRecs(true);
        const recPath = token
          ? `${API_URL}/api/recommendations/user-recommendations`
          : `${API_URL}/api/recommendations/guest-recommendations`;

        const recRes = await axios.get(recPath, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setRecommendations(recRes.data);
        console.log("the rec data is ", recRes.data)
        setLoadingRecs(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoadingRecs(false);
      }
    };
    fetchData();
  }, [token]);

  /* ---------------- CART ACTION ---------------- */
  /* ---------------- CART ACTION ---------------- */
  const handleQuickAdd = (item) => {
    // 1. Construct the correct image URL (consistent with what CartPage expects)
    const imageUrl = item.image
      ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`)
      : "/placeholder.jpg";

    // 2. Prepare the item object to match your Cart context structure
    const itemToCart = {
      ...item,
      menuItemId: item._id, // Ensure ID mapping is correct for the cart
      image: imageUrl,      // Pass the fully resolved image path
    };
    // 3. Get restaurant ID from the populated field
    const restaurantId = item.restaurantId?._id || item.restaurantId;

    // 4. Add to cart and navigate
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

  /* ---------------- CUISINE LOGIC ---------------- */
  const cuisineMenus = useMemo(() => {
    if (!menuItems?.length) return [];
    const validMenus = menuItems.filter(item => item.category?.trim());
    const uniqueCategories = [...new Set(validMenus.map(i => i.category))];
    return uniqueCategories.slice(0, 8).map((cat, idx) => {
      const items = validMenus.filter(i => i.category === cat);
      return items[idx % items.length];
    }).filter(Boolean);
  }, [menuItems]);

  return (
    <div className="w-full bg-[#FCFCFD] selection:bg-orange-100">
      <section className="space-y-24">

        {/* ======== 1. IMMERSIVE HERO SECTION ======== */}
        <div className="relative h-[85vh] min-h-[650px] overflow-hidden">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${index === heroIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
                }`}
            >
              <img src={img.image} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
            </div>
          ))}

          <div className="absolute inset-0 z-20 flex items-center max-w-[1440px] mx-auto px-8 md:px-16">
            <div className="max-w-3xl">
              <div className="overflow-hidden mb-4">
                <p className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs">
                  Premium Delivery Service
                </p>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 transition-all">
                {heroTexts[heroIndex].title}
              </h1>
              <p className="text-lg text-gray-300 max-w-lg mb-10 font-medium leading-relaxed">
                {heroTexts[heroIndex].subtitle}
              </p>

            </div>

            {/* ======== SELECT RESTAURANT: POSITIONED BELOW NAVBAR ======== */}
            <div className="hidden lg:block ml-auto relative mt-16 self-start">
              <button
                onClick={() => setShowRestaurants(!showRestaurants)}
                className={`flex items-center gap-4 px-6 py-4 bg-white rounded-[24px] shadow-2xl transition-all duration-300 active:scale-95 z-30 ${showRestaurants ? 'bg-slate-900 text-white' : 'hover:bg-orange-50'
                  }`}
              >
                <div className={`p-2 rounded-xl ${showRestaurants ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                  <FiShoppingBag size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Active Hubs</p>
                  <p className="font-black text-sm">Select Restaurant</p>
                </div>
                <div className="ml-4 opacity-30">
                  {showRestaurants ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </button>

              {/* Dropdown Menu - Scrollable Container */}
              {showRestaurants && (
                <div className="absolute top-full right-0 mt-4 w-[350px] bg-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Available Partners</h4>
                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                  </div>

                  {/* This container handles the scrolling */}
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar bg-white">
                    {restaurants.length > 0 ? (
                      restaurants.map((r) => (
                        <div
                          key={r._id}
                          onClick={() => navigate(`/restaurant/${r._id}`)}
                          className="flex items-center gap-4 p-5 hover:bg-orange-50 cursor-pointer transition-colors group border-b border-gray-50 last:border-0"
                        >
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-black text-slate-800 group-hover:text-orange-600 transition-colors truncate">{r.name}</p>
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

                  <div className="p-4 bg-orange-50 text-center">
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">Fastest Delivery in Addis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== 2. PERSONALIZED RECOMMENDATIONS (Dynamic Backend Data) ======== */}
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="space-y-3">
              <div className="h-1.5 w-16 bg-orange-500 rounded-full" />
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                {token ? "Your recommended foods" : "Addis' Most Popular"}
              </h2>
              <p className="text-gray-400 font-medium text-lg">
                {token ? "Smart recommendations based on your unique taste." : "Trending dishes everyone is talking about right now."}
              </p>
            </div>
            <div className="flex gap-3">
              <span className="px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100">
                {recommendations.length} Items Found
              </span>
            </div>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[40px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {recommendations.map((item) => (
                <div key={item._id} className="group relative">
                  <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] group-hover:-translate-y-4">
                    <img
                      src={item.image ? (item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`) : "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                    {/* Top UI: Category & Price */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                      <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                        <p className="text-orange-600 font-black text-sm">{item.price} <span className="text-[10px] opacity-60">ETB</span></p>
                      </div>
                    </div>

                    {/* Bottom UI: Details & Add to Cart */}
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiStar size={12} fill="currentColor" /> {item.restaurantId?.name || "Premium Dish"}
                      </p>
                      <h3 className="text-2xl font-black leading-tight mb-6 uppercase tracking-tighter">{item.name}</h3>

                      {/* THE (+) ADD TO CART ICON BUTTON */}
                      <button
                        onClick={() => handleQuickAdd(item)}
                        title="Add to cart & checkout"
                        className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-gray-900 transition-all active:scale-90"
                      >
                        <FiPlus size={24} strokeWidth={3} />
                      </button>
                      {/* <button className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-colors">
                          <FiHeart size={18} />
                        </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======== 3. BROWSE BY CUISINE ======== */}
        <div className="bg-slate-900 py-32">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <h2 className="text-5xl font-black text-white tracking-tighter">
                Browse By <span className="text-orange-500 italic">Cuisine</span>
              </h2>
              <div className="h-[1px] flex-1 bg-white/10 mx-10 hidden lg:block" />
              <div className="px-6 py-3 border border-white/20 rounded-full text-white/40 text-[10px] font-black uppercase tracking-widest">
                Explore Global Flavors
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
              {cuisineMenus.map((menu, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/restaurant/${menu.restaurantId?._id || menu.restaurantId}`)}
                >
                  <div className="relative mb-6">
                    <div className="aspect-square rounded-[50px] overflow-hidden border-8 border-slate-800 transition-all duration-500 group-hover:rounded-[24px] group-hover:border-orange-500 group-hover:rotate-3 shadow-2xl">
                      <img src={`${API_URL}${menu.image}`} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white tracking-wide uppercase group-hover:text-orange-500 transition-colors">
                      {menu.category}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      Explore Regional Specials
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======== 4. TRUST SECTION ======== */}
        <div className="max-w-[1440px] mx-auto px-8 pb-32">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <FiTruck />, title: "Lightning Fast", desc: "Average delivery time of 25 minutes across Addis." },
              { icon: <FiShield />, title: "Secure Payments", desc: "Multi-layered security for all your digital transactions." },
              { icon: <FiClock />, title: "Live Tracking", desc: "Real-time updates from the kitchen to your doorstep." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 items-start p-10 rounded-[40px] bg-white border border-gray-100 hover:shadow-2xl hover:shadow-orange-500/5 transition-all">
                <div className="text-5xl text-orange-500 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{feature.title}</h4>
                  <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F97316; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
}