import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiGrid, FiList, FiCheckCircle, FiXCircle, FiTag, FiDollarSign } from "react-icons/fi";

const API_URL = "http://localhost:5000";
import { useTranslation } from "react-i18next";
export default function Menu() {
  const { t } = useTranslation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRestaurantId = storedUser?.restaurant?.restaurantId;
  const restaurantId =
    rawRestaurantId && rawRestaurantId !== "null"
      ? typeof rawRestaurantId === "object"
        ? rawRestaurantId._id
        : rawRestaurantId
      : null;

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    image: null,
    isAvailable: true,
  });

  /* ================= HELPERS ================= */
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  const getImageUrl = (path) =>
    path ? `${API_URL}${path.startsWith("/") ? "" : "/"}${path}` : null;

  /* ================= FETCH DATA ================= */
  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}`);
    const data = await res.json();
    setRestaurant(data);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchMenu = async () => {
    if (!restaurantId) return;
    const res = await fetch(`${API_URL}/api/menu-items/restaurant/${restaurantId}`);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchMenu();
  }, [restaurantId]);

  /* ================= ACTIONS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem ? `${API_URL}/api/menu-items/${editingItem._id}` : `${API_URL}/api/menu-items`;
    const method = editingItem ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("restaurantId", restaurantId);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("categoryId", form.categoryId);
    formData.append("price", Number(form.price));
    formData.append("isAvailable", form.isAvailable);
    if (form.image instanceof File) formData.append("image", form.image);

    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed");
      return;
    }

    showMessage(editingItem ? "Menu updated successfully!" : "Item added to menu!");
    setShowModal(false);
    setEditingItem(null);
    setForm({ name: "", description: "", categoryId: "", price: "", image: null, isAvailable: true });
    fetchMenu();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    await fetch(`${API_URL}/api/menu-items/${id}`, { method: "DELETE" });
    showMessage("Menu item removed");
    fetchMenu();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">

      {/* HEADER & STATS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {restaurant?.name || t("restaurantMenu")}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 italic">{t("manageFlavors")}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{items.length}</div>
            <p className="text-[10px] uppercase font-bold text-orange-400 dark:text-orange-600">{t("totalItems")}</p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setForm({ name: "", description: "", categoryId: "", price: "", image: null, isAvailable: true });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all font-semibold"
          >
            <FiPlus strokeWidth={3} /> {t("addNewItem")}
          </button>
        </div>
      </div>

      {/* VIEW CONTROLS */}
      <div className="flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-bold" : "text-gray-500 dark:text-slate-500"}`}
          >
            <FiGrid /> {t("grid")}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === "table" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400 font-bold" : "text-gray-500 dark:text-slate-500"}`}
          >
            <FiList /> {t("table")}
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48 w-full bg-gray-100 dark:bg-slate-800">
                {item.image ? (
                  <img src={getImageUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700"><FiGrid size={40} /></div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${item.isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {item.isAvailable ? t("available") : t("soldOut")}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate">{item.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-lg">
                  <span className="text-sm font-medium">ETB</span> {item.price}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium flex items-center gap-1 uppercase tracking-tighter">
                  <FiTag /> {item.categoryId?.name || t("uncategorized")}
                </p>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setForm({ name: item.name, description: item.description || "", categoryId: item.categoryId?._id || "", price: item.price, image: null, isAvailable: item.isAvailable });
                      setShowModal(true);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <FiEdit /> {t("edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{t("item")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{t("category")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{t("price")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{t("status")}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(item.image)} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-slate-800" />
                      <span className="font-bold text-gray-800 dark:text-slate-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-medium">{item.categoryId?.name}</td>
                  <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{item.price} ETB</td>
                  <td className="px-6 py-4">
                    {item.isAvailable ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-500 text-xs font-bold uppercase"><FiCheckCircle /> t("available")</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-bold uppercase"><FiXCircle /> t("soldOut")</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setForm({ name: item.name, description: item.description || "", categoryId: item.categoryId?._id || "", price: item.price, image: null, isAvailable: item.isAvailable }); setShowModal(true); }} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><FiEdit /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300"
          >
            {/* FIXED HEADER */}
            <div className="bg-blue-600 p-5 text-white shrink-0">
              <h2 className="text-xl font-bold">{editingItem ? t("editMenuItem") : t("createMenuItem")}</h2>
              <p className="text-blue-100 text-xs">{t("fillDetails")}</p>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">{t("itemName")}</label>
                  <input className="w-full bg-transparent border-gray-200 dark:border-slate-800 border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm dark:text-white" placeholder="e.g. Special Tibs" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>



                {t("description")}
                {t("itemPhoto")}
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1"> {t("category")}</label>
                  <select className="w-full bg-transparent dark:bg-slate-900 border-gray-200 dark:border-slate-800 border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="" className="dark:bg-slate-900">Select...</option>
                    {categories.map((cat) => <option key={cat._id} value={cat._id} className="dark:bg-slate-900">{cat.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">{t("price")} (ETB)</label>
                  <input type="number" className="w-full bg-transparent border-gray-200 dark:border-slate-800 border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">{t("description")}</label>
                <textarea rows="2" className="w-full bg-transparent border-gray-200 dark:border-slate-800 border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white" placeholder="Briefly describe this dish..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">{t("itemPhoto")}</label>
                <div className="mt-1 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-3 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                  <p className="text-xs text-gray-500 dark:text-slate-500 truncate px-2">{form.image ? form.image.name : t("uploadImage")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-slate-700 focus:ring-blue-500" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-tight">{t("availableInApp")}</span>
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition-all text-sm"
              >
                {t("cancel")}

              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all text-sm"
              >
                {editingItem ? t("saveChanges") : t("createItem")}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* SUCCESS POPUP */}
      {message && (
        <div className="fixed bottom-10 right-10 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 z-[100]">
          <FiCheckCircle className="text-green-400 dark:text-green-600" /> {message}
        </div>
      )}
    </div>
  );
}