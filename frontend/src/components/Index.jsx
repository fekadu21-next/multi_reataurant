import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
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
    fetchRestaurants();
    fetchMenuItems();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants`);
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Restaurant fetch error", err);
      setRestaurants([]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/menu-items`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menu fetch error", err);
      setMenuItems([]);
    }
  };

  /* ---------------- HERO IMAGES ---------------- */
  const heroImages = [
    { image: "/image/img1.jpg" },
    { image: "/image/img2.jpg" },
    { image: "/image/img3.jpg" },
  ];

  const heroTexts = [
    {
      title: "Discover Addis' Best Dishes",
      subtitle: "Fresh & Delicious Every Day",
    },
    {
      title: "Tasty Meals Delivered Fast",
      subtitle: "From Local Favorites to Gourmet",
    },
    {
      title: "Your Flavor, Your Choice",
      subtitle: "Explore Top Restaurants Now",
    },
  ];

  /* ---------------- HERO SLIDER ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  /* ---------------- CUISINE LOGIC (FIXED) ---------------- */
  const cuisineMenus = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    const validMenus = menuItems.filter(
      (item) =>
        item.category &&
        typeof item.category === "string" &&
        item.category.trim() !== "",
    );

    if (validMenus.length === 0) return [];

    const uniqueCategories = [...new Set(validMenus.map((i) => i.category))];
    if (uniqueCategories.length === 0) return [];

    let displayCategories = [...uniqueCategories];

    while (displayCategories.length < 8) {
      displayCategories.push(...uniqueCategories);
    }

    displayCategories = displayCategories.slice(0, 8);

    return displayCategories
      .map((categoryName, index) => {
        const menusForCategory = validMenus.filter(
          (item) => item.category === categoryName,
        );
        if (menusForCategory.length === 0) return null;
        return menusForCategory[index % menusForCategory.length];
      })
      .filter(Boolean);
  }, [menuItems]);

  return (
    <div className="w-full mx-auto pb-10">
      <section className="space-y-10">
        {/* -------- HERO -------- */}
        <div className="relative overflow-hidden h-[550px]">
          {/* Hero Images */}
          {heroImages.map((img, index) => {
            const isActive = index === heroIndex;
            const isPrev =
              index ===
              (heroIndex === 0 ? heroImages.length - 1 : heroIndex - 1);

            return (
              <img
                key={index}
                src={img.image}
                alt={`Hero ${index + 1}`}
                className={`absolute w-full h-full object-cover transition-transform duration-1000 ease-in-out ${
                  isActive
                    ? "translate-x-0 scale-105 opacity-100 z-20"
                    : isPrev
                      ? "-translate-x-full scale-95 opacity-100 z-10"
                      : "translate-x-full scale-95 opacity-0 z-0"
                }`}
              />
            );
          })}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

          {/* Hero Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-10 z-30">
            {heroTexts.map((text, index) => (
              <div
                key={index}
                className={`absolute w-full text-center transition-all duration-1000 ${
                  index === heroIndex
                    ? "opacity-100 translate-y-0 scale-100 font-extrabold text-white"
                    : "opacity-0 -translate-y-10 scale-95 text-gray-300"
                }`}
              >
                <h1 className="text-5xl drop-shadow-lg">{text.title}</h1>
                <p className="text-xl mt-3">{text.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Restaurant Dropdown */}
          <div className="absolute right-10 top-10 z-40 bg-gradient-to-br from-orange-50 to-white rounded-3xl shadow p-4 w-[260px]">
            <button
              onClick={() => setShowRestaurants((p) => !p)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-semibold text-lg">Select Restaurant</h3>
              {showRestaurants ? (
                <FiChevronUp className="text-xl text-orange-500" />
              ) : (
                <FiChevronDown className="text-xl text-orange-500" />
              )}
            </button>

            {showRestaurants && (
              <ul className="mt-3 space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {restaurants.map((r) => (
                  <li
                    key={r._id}
                    onClick={() => {
                      setShowRestaurants(false);
                      navigate(`/restaurant/${r._id}`);
                    }}
                    className="flex justify-between p-2 rounded-2xl bg-white hover:bg-orange-50 cursor-pointer text-sm"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-gray-500">Nearby</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* -------- PERSONALIZED -------- */}
        <div className=" mt-24 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <span className="text-orange-500 text-2xl mr-2">🔥</span>
            Your Personalized Plate
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {menuItems.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="bg-gray-50 rounded-2xl shadow hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={`${API_URL}${item.image}`}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm">{item.name}</h3>

                  {/* ✅ Exact category name from database */}
                  <p className="text-xs text-gray-500">
                    {item.categoryId?.name || "Uncategorized"}
                  </p>

                  <p className="text-orange-600 font-bold mt-2 text-sm">
                    {item.price} ETB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------- TOP RATED -------- */}
        <div className="  p-8 mt-0 mb-8">
          <h2 className="text-xl font-semibold mb-6">⭐ Top-Rated in Addis</h2>

          <div className="flex space-x-12 overflow-x-auto pb-3">
            {menuItems.slice(0, 4).map((item) => (
              <div
                key={item._id}
                className="min-w-[260px] bg-gray-50 rounded-2xl shadow hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={`${API_URL}${item.image}`}
                  alt={item.name}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm">{item.name}</h3>

                  {/* ✅ Exact category name from database */}
                  <p className="text-xs text-gray-500 mt-1">
                    {item.categoryId?.name || "Uncategorized"} •{" "}
                    <span className="font-semibold">4.6 ★</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* -------- CUISINES -------- */}
        <div className=" p-8">
          <h2 className="text-xl font-semibold mb-6">🍽 Browse By Cuisine</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {cuisineMenus.map((menu, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl shadow hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={`${API_URL}${menu.image}`}
                  alt={menu.name}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-sm">{menu.name}</h3>

                  {/* ✅ Display exact category name from DB */}
                  <p className="text-xs text-gray-500 mt-1">
                    {menu.categoryId?.name || "Uncategorized"}
                  </p>

                  {/* ✅ Display exact restaurant name */}
                  <p className="text-xs text-gray-400 mt-1">
                    {menu.restaurantId?.name || "Restaurant"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
