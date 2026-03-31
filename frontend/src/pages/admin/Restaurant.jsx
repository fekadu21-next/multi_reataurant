import React, { useState, useEffect } from "react";
import {
  FiTrash2, FiEdit, FiPlus, FiMoon, FiSun, FiSearch,
  FiMapPin, FiTruck, FiClock, FiMoreVertical, FiX, FiCheckCircle
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { t } = useTranslation();

  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    ownerId: "",
    address: { street: "", city: "" },
    categories: "",
    deliveryFee: "",
    deliveryTime: "",
    description: "",
    image: null,
  });

  const [editRestaurant, setEditRestaurant] = useState({
    name: "",
    ownerId: "",
    address: { street: "", city: "" },
    categories: "",
    deliveryFee: "",
    deliveryTime: "",
    description: "",
    image: null,
  });

  const [message, setMessage] = useState("");
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/restaurants`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      const data = await res.json();
      const filtered = data.filter((u) => u.role === "restaurant_owner");
      setOwners(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchOwners();
  }, []);

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newRestaurant.name);
      formData.append("ownerId", newRestaurant.ownerId);
      formData.append("street", newRestaurant.address.street);
      formData.append("city", newRestaurant.address.city);
      formData.append(
        "categories",
        JSON.stringify(
          newRestaurant.categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== ""),
        ),
      );
      formData.append("deliveryFee", newRestaurant.deliveryFee);
      formData.append("deliveryTime", newRestaurant.deliveryTime);
      formData.append("description", newRestaurant.description);
      if (newRestaurant.image) formData.append("image", newRestaurant.image);

      const res = await fetch(`${API_URL}/api/restaurants`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setRestaurants((prev) => [...prev, data.restaurant]);
        showMessage(t("restaurantAdded"));
        setShowAddModal(false);
        setNewRestaurant({
          name: "",
          ownerId: "",
          address: { street: "", city: "" },
          categories: "",
          deliveryFee: "",
          deliveryTime: "",
          description: "",
          image: null,
        });
      } else {
        showMessage(data.message || "Failed to add restaurant");
      }
    } catch (err) {
      showMessage(t("serverError"));
    }
  };

  const handleEditClick = (r) => {
    setSelectedRestaurant(r);
    setEditRestaurant({
      name: r.name,
      ownerId: r.ownerId,
      address: r.address,
      categories: r.categories.join(", "),
      deliveryFee: r.deliveryFee,
      deliveryTime: r.deliveryTime,
      description: r.description || "",
      image: null,
    });
    setShowEditModal(true);
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editRestaurant.name);
      formData.append("ownerId", editRestaurant.ownerId);
      formData.append("street", editRestaurant.address.street);
      formData.append("city", editRestaurant.address.city);
      formData.append(
        "categories",
        JSON.stringify(
          editRestaurant.categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== ""),
        ),
      );
      formData.append("deliveryFee", editRestaurant.deliveryFee);
      formData.append("deliveryTime", editRestaurant.deliveryTime);
      formData.append("description", editRestaurant.description);
      if (editRestaurant.image) formData.append("image", editRestaurant.image);

      const res = await fetch(
        `${API_URL}/api/restaurants/${selectedRestaurant._id}`,
        { method: "PUT", body: formData },
      );

      const data = await res.json();
      if (!res.ok) return showMessage(data.message);

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === selectedRestaurant._id ? data.restaurant : r,
        ),
      );
      showMessage(t("restaurantUpdated"));
      setShowEditModal(false);
      setSelectedRestaurant(null);
    } catch (err) {
      showMessage(t("updateFailed"));
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/restaurants/${selectedRestaurant._id}`, {
        method: "DELETE",
      });

      setRestaurants((prev) =>
        prev.filter((r) => r._id !== selectedRestaurant._id),
      );
      showMessage(t("restaurantDeleted"));
      setShowDeleteModal(false);
    } catch (err) {
      showMessage(t("deleteFailed"));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 px-4 sm:px-8 py-6 sm:py-10">

      {/* Notifications */}
      {message && (
        <div className="fixed top-4 sm:top-8 right-4 sm:right-8 bg-emerald-500 text-white px-4 sm:px-6 py-3 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2 font-medium">
          <FiCheckCircle className="shrink-0" />
          <span className="text-sm sm:text-base">{message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 sm:mb-10">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight"> {t("restaurantHub")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">{t("manageFoodNetwork")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64 lg:w-80 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={t("searchRestaurant")}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 font-semibold text-sm sm:text-base"
          >
            <FiPlus size={20} /> <span className="whitespace-nowrap">{t("addRestaurant")}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on Small Screens) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-5">{t("restaurant")}</th>
                <th className="px-6 py-5">{t("owner")}</th>
                <th className="px-6 py-5">{t("details")}</th>
                <th className="px-6 py-5 hidden lg:table-cell">{t("description")}</th>
                <th className="px-6 py-5">{t("delivery")}</th>
                <th className="px-6 py-5 text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6"><div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" /></td>
                  </tr>
                ))
              ) : filteredRestaurants.map((r) => {
                const owner = owners.find((o) => o._id === r.ownerId);
                return (
                  <tr key={r._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          {r.image ? (
                            <img
                              src={`${API_URL}${r.image}`}
                              alt={r.name}
                              className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-xl lg:rounded-2xl shadow-md group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 dark:bg-slate-800 rounded-xl lg:rounded-2xl flex items-center justify-center text-[10px] text-slate-400 font-bold">N/A</div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{r.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.categories.slice(0, 2).map((cat, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase">{cat}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{owner?.fullname || t("unassigned")}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Manager</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 font-medium"><FiMapPin className="text-rose-500" size={12} /> {r.address.city}</div>
                        <div className="opacity-70 truncate max-w-[100px] ml-4">{r.address.street}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[180px] leading-relaxed italic">
                        "{r.description || t("noDescription")}"
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                          <FiTruck size={12} /> {r.deliveryFee} ETB
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <FiClock size={12} /> {r.deliveryTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRestaurant(r);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Visible only on Small Screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 h-48 rounded-2xl animate-pulse" />
          ))
        ) : filteredRestaurants.map((r) => {
          const owner = owners.find((o) => o._id === r.ownerId);
          return (
            <div key={r._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex gap-4">
                <div className="shrink-0">
                  {r.image ? (
                    <img src={`${API_URL}${r.image}`} alt={r.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No Image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate pr-6">{r.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => handleEditClick(r)} className="p-1.5 text-slate-400 hover:text-indigo-500"><FiEdit size={16} /></button>
                      <button onClick={() => { setSelectedRestaurant(r); setShowDeleteModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-500"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter mt-0.5">{owner?.fullname || t("unassigned")}</p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.categories.slice(0, 3).map((cat, i) => (
                      <span key={i} className="text-[8px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-bold uppercase italic">{cat}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-rose-500" size={14} />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate">{r.address.city}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <FiTruck className="text-emerald-500" size={14} />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">{r.deliveryFee} ETB</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showAddModal && (
        <Modal title={t("onboardRestaurant")} onClose={() => setShowAddModal(false)}>
          <AddEditForm
            type="add"
            restaurant={newRestaurant}
            setRestaurant={setNewRestaurant}
            handleSubmit={handleAddRestaurant}
            owners={owners}
            closeModal={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {showEditModal && (
        <Modal title={t("updateBusiness")} onClose={() => setShowEditModal(false)}>
          <AddEditForm
            type="edit"
            restaurant={editRestaurant}
            setRestaurant={setEditRestaurant}
            handleSubmit={handleUpdateRestaurant}
            owners={owners}
            closeModal={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title={t("confirmAction")} onClose={() => setShowDeleteModal(false)}>
          <div className="text-center py-4 px-2 sm:p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiTrash2 size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("areYouSure")}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 px-2 sm:px-4 text-sm sm:text-base leading-relaxed">
              {t("deleteWarning")} <span className="font-bold text-slate-900 dark:text-white">"{selectedRestaurant?.name}"</span>. {t("irreversibleAction")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="order-2 sm:order-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
              >
                {t("goBack")}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="order-1 sm:order-2 px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all text-sm"
              >
                {t("yesDelete")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* MODAL WRAPPER (Responsive) */
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex justify-center items-end sm:items-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-[2rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <h3 className="text-lg sm:text-xl font-bold dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"><FiX size={20} /></button>
        </div>
        <div className="p-5 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

/* FORM COMPONENT (Responsive Grid) */
function AddEditForm({ type, restaurant, setRestaurant, handleSubmit, owners, closeModal }) {
  const inputClass = "w-full px-4 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white placeholder:text-slate-400 text-sm sm:text-base";
  const labelClass = "block text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1";
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass}>{t("restaurantName")}</label>
          <input
            type="text"
            placeholder="e.g. Skyline Cafe"
            className={inputClass}
            value={restaurant.name}
            onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            required
          />
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("ownerManager")}</label>
          <select
            className={inputClass}
            value={restaurant.ownerId}
            onChange={(e) => setRestaurant({ ...restaurant, ownerId: e.target.value })}
            required
          >
            <option value="">Select Partner</option>
            {owners.map((o) => (
              <option key={o._id} value={o._id}>{o.fullname}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("categories")}</label>
          <input
            type="text"
            placeholder="Pizza, Burger"
            className={inputClass}
            value={restaurant.categories}
            onChange={(e) => setRestaurant({ ...restaurant, categories: e.target.value })}
            required
          />
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("streetAddress")}</label>
          <input
            type="text"
            placeholder="123 Bole St."
            className={inputClass}
            value={restaurant.address.street}
            onChange={(e) => setRestaurant({ ...restaurant, address: { ...restaurant.address, street: e.target.value } })}
            required
          />
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("city")}</label>
          <input
            type="text"
            placeholder="Addis Ababa"
            className={inputClass}
            value={restaurant.address.city}
            onChange={(e) => setRestaurant({ ...restaurant, address: { ...restaurant.address, city: e.target.value } })}
            required
          />
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("deliveryFee")}</label>
          <input
            type="number"
            placeholder="0.00"
            className={inputClass}
            value={restaurant.deliveryFee}
            onChange={(e) => setRestaurant({ ...restaurant, deliveryFee: e.target.value })}
            required
          />
        </div>

        <div className="col-span-1">
          <label className={labelClass}>{t("deliveryTime")}</label>
          <input
            type="text"
            placeholder="25-35 mins"
            className={inputClass}
            value={restaurant.deliveryTime}
            onChange={(e) => setRestaurant({ ...restaurant, deliveryTime: e.target.value })}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("businessDescription")}</label>
          <textarea
            className={`${inputClass} min-h-[80px] sm:min-h-[100px] resize-none`}
            placeholder="Briefly describe the restaurant..."
            value={restaurant.description}
            onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("brandingImage")}</label>
          <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-6 hover:border-indigo-500 transition-colors text-center bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setRestaurant({ ...restaurant, image: e.target.files[0] })}
            />
            <div className="text-slate-400 group-hover:text-indigo-500 font-bold text-xs sm:text-sm flex flex-col items-center gap-2">
              <FiPlus size={24} className="opacity-50" />
              {restaurant.image ? <span className="text-indigo-600 dark:text-indigo-400">{restaurant.image.name}</span> : "Upload Store Image"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
        <button
          type="button"
          onClick={closeModal}
          className="order-2 sm:order-1 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
        >
          {t("discard")}
        </button>
        <button
          type="submit"
          className="order-1 sm:order-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-sm"
        >
          {type === "add" ? t("launchRestaurant") : t("saveChanges")}
        </button>
      </div>
    </form>
  );
}