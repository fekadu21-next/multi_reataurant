import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Clock, Plus, Eye, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000";

export default function RestaurantMenu() {
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();

  /* ================= CART ================= */
  const { addToCart } = useCart();

  /* ================= STATES ================= */
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  /* ================= FETCH RESTAURANT ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/restaurants/${restaurantId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.image && !data.image.startsWith("http")) {
          data.image = `${API_URL}${data.image}`;
        }
        setRestaurant(data);
      });
  }, [restaurantId]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        if (data.length) setActiveCategory(data[0]._id);
      });
  }, []);

  /* ================= FETCH MENU ITEMS ================= */
  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    fetch(`${API_URL}/api/menu-items/restaurant/${restaurantId}`)
      .then((r) => r.json())
      .then((data) => {
        const updated = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              image: item.image ? `${API_URL}${item.image}` : "",
            }))
          : [];
        setMenuItems(updated);
        setLoading(false);
      });
  }, [restaurantId]);

  /* ================= FILTER ================= */
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => item.categoryId?._id === activeCategory);
  }, [menuItems, activeCategory]);

  /* ================= HANDLERS ================= */
  const handleAddToCart = (item) => {
    addToCart(item, restaurantId);
    navigate("/cart"); // ✅ Go to cart immediately
  };

  const handleViewDetails = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  if (!restaurant) return <p className="p-10 text-center">Loading...</p>;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 pb-64">
      {/* HERO */}
      <div className="relative h-[420px] overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-8 text-white">
          <h1 className="text-4xl font-bold">{restaurant.name}</h1>
          <p className="mt-2">{restaurant.description}</p>
          <div className="flex gap-6 mt-3 text-sm">
            <span className="bg-orange-500 px-3 py-1 rounded-full flex gap-1 items-center">
              <Star size={14} fill="white" /> {restaurant.rating || 4.8}
            </span>
            <span className="flex gap-1 items-center">
              <Clock size={14} /> {restaurant.deliveryTime || "25–35 min"}
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORY BUTTONS */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="grid grid-flow-col auto-cols-fr gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`py-3 px-5 rounded-full font-semibold ${
                activeCategory === cat._id
                  ? "bg-orange-500 text-white"
                  : "bg-white border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* MENU ITEMS */}
      <main className="max-w-[1200px] mx-auto px-6 mt-10">
        {loading ? (
          <p className="text-center py-20">Loading menu...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="relative bg-white rounded-3xl overflow-hidden shadow"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}

                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-green-600 text-white p-2 rounded-full"
                  >
                    <Plus size={18} />
                  </button>

                  <button
                    onClick={() => handleViewDetails(item)}
                    className="bg-blue-600 text-white p-2 rounded-full"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.categoryId?.name}
                  </p>
                  <p className="text-orange-600 font-bold mt-2">
                    {item.price} ETB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DETAILS MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600"
            >
              <X />
            </button>

            {selectedItem.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
            )}

            <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
            <p>Category: {selectedItem.categoryId?.name}</p>
            <p className="text-orange-600 font-bold my-2">
              {selectedItem.price} ETB
            </p>
            <p>{selectedItem.description || "No description"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
