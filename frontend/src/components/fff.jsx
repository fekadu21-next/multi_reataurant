import React, { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Index() {
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
    const res = await fetch(`${API_URL}/api/restaurants`);
    const data = await res.json();
    setRestaurants(data || []);
  };

  const fetchMenuItems = async () => {
    const res = await fetch(`${API_URL}/api/menu-items`);
    const data = await res.json();
    setMenuItems(data || []);
  };

  /* ---------------- HERO SLIDER (FROM MENUS) ---------------- */
  const heroImages = menuItems.slice(0, 3);

  useEffect(() => {
    if (heroImages.length < 2) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [heroImages]);

  return (
    <div className="w-full mx-auto px-6 py-10 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-10">
        {/* ================= LEFT ================= */}
        <section className="lg:col-span-6 space-y-10">
          {/* -------- HERO (MENU IMAGES) -------- */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg h-[390px] bg-black">
            {heroImages.length > 0 && heroImages[heroIndex]?.image && (
              <img
                key={heroIndex}
                src={`${API_URL}${heroImages[heroIndex].image}`}
                alt={heroImages[heroIndex].name}
                className="
                  w-full h-full object-cover
                 transform transition-transform duration-1000
                  scale-105
                "
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

            <div className="absolute left-80 top-10 text-white max-w-xl">
              <h1 className="text-4xl font-extrabold drop-shadow-lg">
                Find Your Flavor.
              </h1>
              <p className="text-lg mt-2 opacity-90">
                Fast Delivery, Addis Wide
              </p>
              {/* <p className="mt-6 bg-orange-500 px-5 py-2 rounded-full text-sm shadow-md inline-block">
                Order from top restaurants now!
              </p> */}
            </div>
          </div>

          {/* -------- PERSONALIZED (MENUS) -------- */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center dark:text-white">
              <span className="text-orange-500 text-2xl mr-2">🔥</span>
              Your Personalized Plate
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {menuItems.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                >
                  <img
                    src={`${API_URL}${item.image}`}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <p className="text-orange-600 font-bold mt-2 text-sm">
                      {item.price} ETB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -------- TOP RATED (3 MENU IMAGES) -------- */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">
              ⭐ Top-Rated in Addis
            </h2>

            <div className="flex space-x-6 overflow-x-auto pb-3">
              {menuItems.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="min-w-[260px] bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                >
                  <img
                    src={`${API_URL}${item.image}`}
                    alt={item.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.category} •{" "}
                      <span className="font-semibold">4.6 ★</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* -------- CUISINES -------- */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow p-8">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">
              🍽 Browse By Cuisine
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[...new Set(menuItems.map((i) => i.category))].map((cat, i) => {
                // Find the first menu item for this category
                const categoryItem = menuItems.find(
                  (item) => item.category === cat
                );

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 hover:shadow-lg transition"
                  >
                    {categoryItem?.image && (
                      <img
                        src={`${API_URL}${categoryItem.image}`}
                        alt={categoryItem.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium text-sm mt-3 dark:text-white">
                      {cat}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= RIGHT ================= */}
        <aside className="lg:col-span-2 space-y-10">
          <div className="sticky top-10 space-y-8">
            {/* -------- RESTAURANT DROPDOWN -------- */}
            <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow p-6">
              <button
                onClick={() => setShowRestaurants(!showRestaurants)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-lg dark:text-white">
                  Select Restaurant
                </h3>
                {showRestaurants ? (
                  <FiChevronUp className="text-xl text-orange-500" />
                ) : (
                  <FiChevronDown className="text-xl text-orange-500" />
                )}
              </button>

              {showRestaurants && (
                <ul className="mt-5 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {restaurants.map((r) => (
                    <li
                      key={r._id}
                      className="flex items-center justify-between p-3 rounded-2xl
                      bg-white dark:bg-gray-800
                      hover:bg-orange-50 dark:hover:bg-gray-700
                      transition cursor-pointer"
                    >
                      <span className="text-sm font-medium dark:text-white">
                        {r.name}
                      </span>
                      <span className="text-xs text-gray-500">Nearby</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* -------- DELIVERY -------- */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow text-center">
              <p className="font-semibold text-lg dark:text-white">
                Delivery Fee
              </p>
              <p className="text-gray-500 text-sm mt-1">Starts from 20 Br</p>
              <button className="mt-5 w-full py-3 bg-orange-500 text-white rounded-full text-sm font-medium shadow hover:bg-orange-600 transition">
                Order Now
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
