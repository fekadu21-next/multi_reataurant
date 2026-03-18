import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit, FiPlus, FiMoon, FiSun, FiSearch, FiMapPin, FiTruck, FiClock } from "react-icons/fi";
const API_URL = "http://localhost:5000";
export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  //   if (!isDarkMode) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/restaurants`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.log(err);
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
      console.log(err);
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
        showMessage("Restaurant added successfully!");
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
      showMessage("Server error");
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

      showMessage("Restaurant updated successfully!");
      setShowEditModal(false);
      setSelectedRestaurant(null);
    } catch (err) {
      showMessage("Update failed");
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
      showMessage("Restaurant deleted!");
      setShowDeleteModal(false);
    } catch (err) {
      showMessage("Delete failed");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 px-8 py-10">
      {message && (
        <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2 font-medium">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {message}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your food network and delivery partners</p>
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            onClick={toggleDarkMode}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all group"
          >
            {isDarkMode ? <FiSun size={20} className="text-amber-400" /> : <FiMoon size={20} className="text-indigo-600" />}
          </button> */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 font-semibold"
          >
            <FiPlus size={20} /> Add Restaurant
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="relative w-full md:w-96 mb-8 group">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Filter restaurants by name..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-5">Restaurant</th>
                <th className="px-6 py-5">Owner</th>
                <th className="px-6 py-5">Details</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Delivery</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-6"><div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" /></td>
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
                              className="w-14 h-14 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                          <div className="flex gap-1 mt-1">
                            {r.categories.slice(0, 2).map((cat, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">{cat}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{owner?.fullname || "Unassigned"}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-tighter">Manager</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5"><FiMapPin className="text-rose-500" size={14} /> {r.address.city}</div>
                        <div className="text-xs ml-5 opacity-70 truncate max-w-[120px]">{r.address.street}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[200px] leading-relaxed italic">
                        "{r.description || "No description provided."}"
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <FiTruck size={14} /> {r.deliveryFee} ETB
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <FiClock size={14} /> {r.deliveryTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(r)}
                          className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all shadow-sm"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRestaurant(r);
                            setShowDeleteModal(true);
                          }}
                          className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all shadow-sm"
                        >
                          <FiTrash2 size={18} />
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

      {/* Modals */}
      {showAddModal && (
        <Modal title="Onboard Restaurant" onClose={() => setShowAddModal(false)}>
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
        <Modal title="Update Business" onClose={() => setShowEditModal(false)}>
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
        <Modal title="Confirm Action" onClose={() => setShowDeleteModal(false)}>
          <div className="text-center p-4">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Are you sure?</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 px-4">
              You are about to remove <span className="font-bold text-slate-900 dark:text-white">"{selectedRestaurant?.name}"</span>. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* MODAL WRAPPER */
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:divide-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">✕</button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/* FORM COMPONENT */
function AddEditForm({ type, restaurant, setRestaurant, handleSubmit, owners, closeModal }) {
  const inputClass = "w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className={labelClass}>Restaurant Name</label>
          <input
            type="text"
            placeholder="e.g. Skyline Cafe"
            className={inputClass}
            value={restaurant.name}
            onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Owner / Manager</label>
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

        <div>
          <label className={labelClass}>Street Address</label>
          <input
            type="text"
            placeholder="123 Bole St."
            className={inputClass}
            value={restaurant.address.street}
            onChange={(e) => setRestaurant({ ...restaurant, address: { ...restaurant.address, street: e.target.value } })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            placeholder="Addis Ababa"
            className={inputClass}
            value={restaurant.address.city}
            onChange={(e) => setRestaurant({ ...restaurant, address: { ...restaurant.address, city: e.target.value } })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Categories</label>
          <input
            type="text"
            placeholder="Pizza, Burger, Italian"
            className={inputClass}
            value={restaurant.categories}
            onChange={(e) => setRestaurant({ ...restaurant, categories: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Delivery Fee (ETB)</label>
          <input
            type="number"
            className={inputClass}
            value={restaurant.deliveryFee}
            onChange={(e) => setRestaurant({ ...restaurant, deliveryFee: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Est. Delivery Time</label>
          <input
            type="text"
            placeholder="25-35 mins"
            className={inputClass}
            value={restaurant.deliveryTime}
            onChange={(e) => setRestaurant({ ...restaurant, deliveryTime: e.target.value })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Business Description</label>
          <textarea
            className={`${inputClass} min-h-[100px] resize-none`}
            placeholder="Briefly describe the restaurant's vibe or specialty..."
            value={restaurant.description}
            onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Branding Image</label>
          <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-indigo-500 transition-colors text-center bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setRestaurant({ ...restaurant, image: e.target.files[0] })}
            />
            <div className="text-slate-400 group-hover:text-indigo-500 font-medium">
              {restaurant.image ? restaurant.image.name : "Click to upload store image"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={closeModal}
          className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Discard
        </button>
        <button
          type="submit"
          className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          {type === "add" ? "Launch Restaurant" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}