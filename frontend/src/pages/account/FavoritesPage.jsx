import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, Utensils, Pizza, Store, ArrowRight, Loader2 } from "lucide-react"; // Optional: lucide-react for icons

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites =
    filter === "all"
      ? favorites
      : favorites.filter((fav) => fav.type === filter);

  /* ================= NAVIGATION LOGIC (UNTOUCHED) ================= */
  const handleNavigate = (fav) => {
    if (fav.type === "restaurant") {
      navigate(`/restaurant/${fav.restaurant._id}`);
    } else if (fav.type === "dish") {
      navigate(`/restaurant/${fav.restaurant._id}`, {
        state: { dishId: fav.dish._id, categoryId: fav.dish.categoryId?._id },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={32} />
              Your Favorites
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Quick access to the flavors you love most.</p>
          </div>

          {/* Modern Tab-style Filter */}
          <div className="inline-flex p-1 bg-gray-200/50 rounded-2xl backdrop-blur-sm">
            {[
              { id: "all", label: "All", icon: <Utensils size={16} /> },
              { id: "restaurant", label: "Restaurants", icon: <Store size={16} /> },
              { id: "dish", label: "Dishes", icon: <Pizza size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${filter === tab.id
                    ? "bg-white text-orange-600 shadow-sm scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h3 className="text-xl font-medium text-gray-700 animate-pulse">
              Loading your favorites...
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredFavorites.length === 0 ? (
          /* Modern Empty State */
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-gray-300" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">No favorites yet</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              Tap the heart icon on any restaurant or dish to see them here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-8 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((fav) => {

              /* RESTAURANT CARD - Horizontal Sleek Design */
              if (fav.type === "restaurant") {
                return (
                  <div
                    key={fav._id}
                    onClick={() => handleNavigate(fav)}
                    className="group cursor-pointer bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex items-center gap-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="text-orange-500" size={20} />
                    </div>
                    {fav.restaurant?.image ? (
                      <img
                        src={fav.restaurant.image}
                        alt={fav.restaurant.name}
                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-gray-50 group-hover:ring-orange-50"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-inner">
                        {fav.restaurant?.name?.charAt(0) || "R"}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Restaurant</span>
                      <h3 className="font-bold text-xl text-gray-800 mt-1 group-hover:text-orange-600 transition-colors">
                        {fav.restaurant?.name}
                      </h3>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        Click to view menu
                      </p>
                    </div>
                  </div>
                );
              }

              /* DISH CARD - Visual Focus Design */
              if (fav.type === "dish") {
                return (
                  <div
                    key={fav._id}
                    onClick={() => handleNavigate(fav)}
                    className="group cursor-pointer bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {fav.dish?.image ? (
                        <img
                          src={fav.dish.image}
                          alt={fav.dish.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
                          No Image Available
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                        <p className="text-orange-600 font-black text-sm">
                          {fav.dish?.price} ETB
                        </p>
                      </div>
                    </div>

                    <div className="p-6">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                        {fav.dish?.category || "Dish"}
                      </span>
                      <h3 className="font-bold text-xl text-gray-800 mt-2 group-hover:text-orange-600 transition-colors">
                        {fav.dish?.name}
                      </h3>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Store size={14} />
                          <span className="truncate max-w-[120px]">{fav.restaurant?.name || "Unknown"}</span>
                        </div>
                        <button className="text-orange-500 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Order <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;