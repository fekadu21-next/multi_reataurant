import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaFilter,
  FaArrowRight,
  FaUtensils,
  FaCompass,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
const API_URL = "http://localhost:5000";

const Restaurants = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/restaurants`);
        setRestaurants(res.data);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // ✅ Extract categories dynamically (Logic Unchanged)
  const categories = [
    "All",
    ...new Set(restaurants.flatMap((r) => r.categories || [])),
  ];

  // ✅ Filtering (Logic Unchanged)
  const filteredRestaurants = restaurants.filter((res) => {
    const matchesSearch = res.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      (res.categories && res.categories.includes(activeCategory));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#fdfdfd] dark:bg-[#030712] min-h-screen pb-32 transition-colors duration-700 font-sans">

      {/* --- PREMIUM HEADER & SEARCH --- */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Designer Background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto ">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">
                <FaCompass className="animate-spin-slow" /> Discover Now
              </div> */}
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                <Trans
                  i18nKey="exploreCity"
                  values={{ city: t("cityAddis") }}
                  components={[<span className="text-orange-500" />]}
                />
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-lg italic">
                {t("savorDescription")}🍽️
              </p>
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full lg:w-[450px] group">
              <div className="absolute inset-0 bg-orange-500/10 blur-2xl group-focus-within:bg-orange-500/20 transition-all" />
              <div className="relative flex items-center">
                <FaSearch className="absolute left-6 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t("searchRestaurants")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-6 rounded-[2rem] bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white text-lg shadow-xl transition-all"
                />
              </div>
            </div>
          </div>

          {/* CATEGORY NAV */}
          <div className="flex flex-wrap gap-4 mt-16 pb-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-90 ${activeCategory === cat
                  ? "bg-slate-900 dark:bg-orange-500 text-white shadow-2xl shadow-orange-500/40 translate-y-[-2px]"
                  : "bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-orange-500/50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section >

      {/* --- CONTENT SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 mt-10" >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <FaFilter className="text-xs" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {t("availableKitchens")}  ({filteredRestaurants.length})
          </h2>
        </div>

        {/* LOADING STATE - SKELETON CARDS */}
        {
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900/50 rounded-[40px] h-[480px] animate-pulse border border-slate-100 dark:border-slate-800">
                  <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-t-[40px]" />
                  <div className="p-8 space-y-4">
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 w-2/3 rounded-lg" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredRestaurants.map((res) => (
                <div
                  key={res._id}
                  className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 hover:-translate-y-4"
                >
                  {/* IMAGE COMPONENT */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={`${API_URL}${res.image}`}
                      alt={res.name}
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    />

                    {/* Floating Rating */}
                    <div className="absolute top-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20">
                      <FaStar className="text-orange-500 text-xs" />
                      <span className="text-sm font-black dark:text-white">
                        {res.rating || "5.0"}
                      </span>
                    </div>

                    {/* Top Overlay Badge */}
                    {res.categories?.[0] && (
                      <div className="absolute bottom-6 left-6">
                        <span className="bg-orange-500 text-white text-[10px] uppercase font-black tracking-widest px-5 py-2.5 rounded-xl shadow-xl">
                          {res.categories[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFO CONTENT */}
                  <div className="p-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-orange-500 transition-colors duration-300">
                      {res.name}
                    </h3>

                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-8">
                      <FaMapMarkerAlt className="text-orange-500/40" />
                      <p className="text-sm font-bold truncate">
                        {res.address?.city} • {res.address?.street}
                      </p>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent mb-8" />

                    {/* NAVIGATION LINK */}
                    <div
                      onClick={() => navigate(`/restaurant/${res._id}`)}
                      className="flex justify-between items-center cursor-pointer group/nav"
                    >
                      <span className="text-sm font-bold  italic uppercase tracking-widest text-slate-900 dark:text-white group-hover/nav:text-orange-500 transition-colors">
                        {t("goToPage")}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover/nav:bg-orange-500 group-hover/nav:text-white transition-all duration-500 shadow-lg">
                        <FaArrowRight className="text-xs transform group-hover/nav:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-40 bg-white dark:bg-slate-900/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <FaUtensils className="text-slate-300 text-3xl" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{t("emptyPlate")}</h3>
              <p className="text-slate-500 mt-2 font-medium">{t("emptyDescription")}</p>
              <button
                onClick={() => { setSearchTerm(""); setActiveCategory("All") }}
                className="mt-8 text-orange-500 font-black uppercase text-xs tracking-widest hover:underline decoration-2"
              >
                {t("clearFilters")}
              </button>
            </div>
          )
        }
      </section >

      {/* --- INLINE GLOBAL STYLES --- */}
      < style > {`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style >
    </div >
  );
};

export default Restaurants;