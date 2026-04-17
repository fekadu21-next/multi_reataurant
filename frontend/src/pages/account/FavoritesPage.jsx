import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  Utensils,
  Pizza,
  Store,
  ArrowRight,
  Loader2,
} from "lucide-react";

const API_BASE = "https://multi-reataurant-1.onrender.com";

/* ✅ SAFE IMAGE HANDLER (same as Restaurants page) */
const getImageUrl = (path) => {
  if (!path) return "";

  // already full URL
  if (path.startsWith("http")) return path;

  return `${API_BASE}${path}`;
};

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

      const res = await axios.get(
        `${API_BASE}/api/user/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("🔥 Favorites:", res.data.favorites);

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

  const handleNavigate = (fav) => {
    if (fav.type === "restaurant") {
      navigate(`/restaurant/${fav.restaurant._id}`);
    } else if (fav.type === "dish") {
      navigate(`/restaurant/${fav.restaurant._id}`, {
        state: {
          dishId: fav.dish._id,
          categoryId: fav.dish.categoryId?._id,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
              <Heart className="text-red-500 fill-red-500" size={32} />
              Your Favorites
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Quick access to the flavors you love most.
            </p>
          </div>

          {/* FILTER */}
          <div className="inline-flex p-1 bg-gray-200/50 rounded-2xl">
            {[
              { id: "all", label: "All", icon: <Utensils size={16} /> },
              { id: "restaurant", label: "Restaurants", icon: <Store size={16} /> },
              { id: "dish", label: "Dishes", icon: <Pizza size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition ${filter === tab.id
                    ? "bg-white text-orange-600 shadow scale-105"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
            <h3 className="text-xl text-gray-700">
              Loading your favorites...
            </h3>
          </div>
        ) : filteredFavorites.length === 0 ? (
          /* EMPTY */
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed">
            <Heart className="text-gray-300 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold">No favorites yet</h3>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((fav) => {

              /* RESTAURANT CARD */
              if (fav.type === "restaurant") {
                return (
                  <div
                    key={fav._id}
                    onClick={() => handleNavigate(fav)}
                    className="group cursor-pointer bg-white p-6 rounded-3xl shadow flex items-center gap-5"
                  >
                    {fav.restaurant?.image ? (
                      <img
                        src={getImageUrl(fav.restaurant.image)}
                        alt={fav.restaurant.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-400 text-white flex items-center justify-center rounded-2xl">
                        {fav.restaurant?.name?.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-lg">
                        {fav.restaurant?.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Click to view menu
                      </p>
                    </div>
                  </div>
                );
              }

              /* DISH CARD */
              if (fav.type === "dish") {
                return (
                  <div
                    key={fav._id}
                    onClick={() => handleNavigate(fav)}
                    className="bg-white rounded-3xl shadow overflow-hidden"
                  >
                    <div className="h-48">
                      {fav.dish?.image ? (
                        <img
                          src={getImageUrl(fav.dish.image)}
                          alt={fav.dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold">{fav.dish?.name}</h3>
                      <p className="text-orange-500 font-bold">
                        {fav.dish?.price} ETB
                      </p>
                      <p className="text-sm text-gray-400">
                        {fav.restaurant?.name}
                      </p>
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