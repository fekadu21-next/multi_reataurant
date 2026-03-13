import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown, FiChevronUp, FiStar, FiMapPin, FiArrowRight,
  FiTruck, FiShield, FiClock, FiHeart, FiShoppingBag
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function Index() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showRestaurants, setShowRestaurants] = useState(false);

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
        // console.log("restnt data is ", dataRest)
        setRestaurants(Array.isArray(dataRest) ? dataRest : []);
        setMenuItems(Array.isArray(dataMenu) ? dataMenu : []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

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

          {/* Hero Content */}
          <div className="absolute inset-0 z-20 flex items-center max-w-[1440px] mx-auto px-8 md:px-16">
            <div className="max-w-3xl">
              <div className="overflow-hidden mb-4">
                <p className="text-orange-500 font-black tracking-[0.3em] uppercase text-xs animate-in slide-in-from-bottom-full duration-700">
                  Premium Delivery Service
                </p>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8">
                {heroTexts[heroIndex].title}
              </h1>
              <p className="text-lg text-gray-300 max-w-lg mb-10 font-medium leading-relaxed">
                {heroTexts[heroIndex].subtitle}
              </p>
              <div className="flex gap-4">
                <button className="px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] transition-all active:scale-95 flex items-center gap-3">
                  ORDER NOW <FiArrowRight strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* ======== SELECT RESTAURANT: MODERN ICON TOGGLE ======== */}
            <div className="hidden lg:block ml-auto relative -mt-81">
              <button
                onClick={() => setShowRestaurants(!showRestaurants)}
                className={`flex items-center gap-4 px-6 py-4 bg-white rounded-[24px] shadow-2xl transition-all duration-300 active:scale-95 ${showRestaurants ? 'bg-slate-900 text-white' : 'hover:bg-orange-50'}`}
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

              {/* Dropdown Menu */}
              {showRestaurants && (
                <div className="absolute top-full right-0 mt-4 w-[350px] bg-white rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                    <h4 className="font-black text-slate-800">Available Partners</h4>
                    <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                  </div>
                  {/* Scrollable list container */}
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {restaurants.map((r) => (
                      <div
                        key={r._id}
                        onClick={() => navigate(`/restaurant/${r._id}`)}
                        className="flex items-center gap-4 p-5 hover:bg-orange-50 cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 group-hover:text-orange-600 transition-colors">{r.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{r.address?.street}, {r.address?.city}</p>
                        </div>
                        <FiArrowRight className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-orange-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======== 2. YOUR PERSONALIZED PLATE: LUXURY CARDS ======== */}
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-3">
              <div className="h-1 w-12 bg-orange-500 rounded-full" />
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Your Personalized Plate</h2>
              <p className="text-gray-400 font-medium">Specially curated dishes based on your unique taste.</p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm font-black text-orange-600 hover:gap-4 transition-all">
              SEE ALL DISHES <FiArrowRight strokeWidth={3} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {menuItems.slice(0, 4).map((item) => (
              <div key={item._id} className="group relative">
                <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] group-hover:-translate-y-4">
                  <img
                    src={`${API_URL}${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Glass Card Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-orange-500 transition-colors">
                      <FiHeart size={18} />
                    </button>
                    <div className="px-4 py-2 bg-white rounded-2xl shadow-xl">
                      <p className="text-orange-600 font-black text-sm">{item.price} <span className="text-[10px] opacity-50">ETB</span></p>
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">
                      {item.categoryId?.name || "Premium Dish"}
                    </p>
                    <h3 className="text-2xl font-black leading-tight mb-4">{item.name}</h3>
                    <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 active:scale-95">
                      ADD TO ORDER
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======== 3. BROWSE BY CUISINE: ASYMMETRIC GEOMETRY ======== */}
        <div className="bg-slate-900 py-32 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
              <h2 className="text-5xl font-black text-white tracking-tighter text-center md:text-left">
                Browse By <span className="text-orange-500 italic">Cuisine</span>
              </h2>
              <div className="h-[1px] flex-1 bg-white/10 mx-10 hidden lg:block" />
              <div className="flex gap-4">
                <div className="px-6 py-3 border border-white/20 rounded-full text-white/40 text-xs font-black uppercase tracking-widest">
                  Global Flavors
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
              {cuisineMenus.map((menu, index) => (
                <div
                  key={index}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/restaurant/${menu.restaurantId?._id}`)}
                >
                  <div className="relative mb-6">
                    <div className="aspect-square rounded-[50px] overflow-hidden border-8 border-slate-800 transition-all duration-500 group-hover:rounded-[24px] group-hover:border-orange-500 group-hover:rotate-3 shadow-2xl">
                      <img src={`${API_URL}${menu.image}`} alt={menu.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    </div>
                    {/* Badge */}
                    {/* <div className="absolute -bottom-4 -right-2 bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-xl transform group-hover:-translate-y-2 transition-transform">
                      <FiArrowRight size={24} />
                    </div> */}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-black text-white tracking-wide uppercase group-hover:text-orange-500 transition-colors">
                      {menu.category}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      Explore {menu.restaurantId?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======== 4. TRUST SECTION: MODERN ICONS ======== */}
        <div className="max-w-[1440px] mx-auto px-8 pb-32">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <FiTruck />, title: "Lightning Fast", desc: "Average delivery time of 25 minutes across Addis." },
              { icon: <FiShield />, title: "Secure Payments", desc: "Multi-layered security for all your digital transactions." },
              { icon: <FiClock />, title: "Live Tracking", desc: "Real-time updates from the kitchen to your doorstep." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 items-start p-8 rounded-[32px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                <div className="text-4xl text-orange-500 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">{feature.title}</h4>
                  <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* CUSTOM GLOBAL STYLES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}