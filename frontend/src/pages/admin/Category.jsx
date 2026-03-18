import React, { useEffect, useState } from "react";
import {
  Plus, Edit, Trash2, Check, X,
  Layers, ChevronRight, Hash, Type,
  Tag, ListOrdered, Activity, Info,
  AlertCircle, Search, Filter, Moon, Sun
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [newCategory, setNewCategory] = useState({
    key: "",
    name: "",
    label: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      triggerToast("Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD CATEGORY ================= */
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error("Failed to add category");

      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);
      setNewCategory({ key: "", name: "", label: "", icon: "", sortOrder: 0, isActive: true });
      setShowAddForm(false);
      triggerToast("Category created successfully!");
    } catch (error) {
      triggerToast(error.message, "error");
    }
  };

  /* ================= EDIT CATEGORY ================= */
  const startEdit = (category) => {
    setEditingId(category._id);
    setEditCategory({ ...category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCategory({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCategory),
      });
      if (!res.ok) throw new Error("Failed to update category");

      const data = await res.json();
      setCategories((prev) => prev.map((cat) => (cat._id === id ? data.category : cat)));
      cancelEdit();
      triggerToast("Changes saved successfully!");
    } catch (error) {
      triggerToast(error.message, "error");
    }
  };

  /* ================= DELETE CATEGORY ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      triggerToast("Category removed", "info");
    } catch (error) {
      triggerToast(error.message, "error");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium tracking-wide">Initializing Menu Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8 lg:p-12 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-bounce 
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-slate-800 dark:bg-slate-700' : 'bg-emerald-600'} text-white`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Layers className="text-indigo-600 dark:text-indigo-500" size={36} />
              Menu Categories
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Organize your inventory and store departments</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`group flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold shadow-xl transition-all duration-300
                ${showAddForm ? "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-indigo-200 dark:shadow-none"}`}
            >
              {showAddForm ? <X size={20} /> : <Plus size={20} className="group-hover:rotate-90 transition-transform" />}
              {showAddForm ? "Discard Changes" : "Create Category"}
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Layers size={24} /></div>
            <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Items</p><p className="text-2xl font-bold dark:text-white">{categories.length}</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Activity size={24} /></div>
            <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Status</p><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Live</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl"><Filter size={24} /></div>
            <div><p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Filtered</p><p className="text-2xl font-bold dark:text-white">{filteredCategories.length}</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* ================= LEFT SIDE: FORM (Conditional) ================= */}
        {showAddForm && (
          <div className="w-full lg:w-96 shrink-0 animate-in slide-in-from-left duration-500">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">New Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-5">
                {[
                  { label: "Internal Key", key: "key", icon: <Hash size={16} />, placeholder: "e.g. HOT_DRINKS" },
                  { label: "Display Name", key: "name", icon: <Type size={16} />, placeholder: "e.g. Hot Drinks" },
                  { label: "Local Label", key: "label", icon: <Tag size={16} />, placeholder: "e.g. መጠጦች" },
                  { label: "Icon Name", key: "icon", icon: <Info size={16} />, placeholder: "cup, coffee, flame" },
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      {input.icon} {input.label}
                    </label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                      placeholder={input.placeholder}
                      value={newCategory[input.key]}
                      onChange={(e) => setNewCategory(p => ({ ...p, [input.key]: e.target.value }))}
                      required={input.key === 'key' || input.key === 'name'}
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <ListOrdered size={16} /> Priority Order
                  </label>
                  <input
                    type="number"
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    value={newCategory.sortOrder}
                    onChange={(e) => setNewCategory(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Create Department
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= RIGHT SIDE: CONTENT ================= */}
        <div className="grow space-y-6">

          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Filter by name, key or label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition-all text-lg dark:text-white"
            />
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Information</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Meta</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sequence</th>
                    <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                    <tr key={cat._id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">

                      {/* Name & Key Cell */}
                      <td className="px-8 py-6">
                        {editingId === cat._id ? (
                          <div className="space-y-2">
                            <input
                              className="w-full p-2 border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none dark:text-white"
                              value={editCategory.name}
                              onChange={(e) => setEditCategory(p => ({ ...p, name: e.target.value }))}
                            />
                            <input
                              className="w-full p-2 border dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 outline-none"
                              value={editCategory.key}
                              onChange={(e) => setEditCategory(p => ({ ...p, key: e.target.value }))}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                              {cat.icon ? <span className="text-xl capitalize">{cat.icon[0]}</span> : <Layers size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-lg">{cat.name}</p>
                              <p className="text-xs font-mono text-slate-400 uppercase tracking-tighter">{cat.key}</p>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Label & Icon Cell */}
                      <td className="px-8 py-6">
                        {editingId === cat._id ? (
                          <div className="space-y-2">
                            <input
                              className="w-full p-2 border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none dark:text-white"
                              value={editCategory.label}
                              onChange={(e) => setEditCategory(p => ({ ...p, label: e.target.value }))}
                            />
                            <input
                              className="w-full p-2 border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none dark:text-white"
                              value={editCategory.icon}
                              onChange={(e) => setEditCategory(p => ({ ...p, icon: e.target.value }))}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-slate-600 dark:text-slate-300 font-medium">{cat.label || "No Label"}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <Info size={12} /> icon: {cat.icon || 'default'}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Sort Order Cell */}
                      <td className="px-8 py-6">
                        {editingId === cat._id ? (
                          <input
                            type="number"
                            className="w-20 p-2 border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-center dark:text-white"
                            value={editCategory.sortOrder}
                            onChange={(e) => setEditCategory(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700">
                            {cat.sortOrder}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {editingId === cat._id ? (
                            <>
                              <button onClick={() => saveEdit(cat._id)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all"><Check size={18} /></button>
                              <button onClick={cancelEdit} className="p-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"><X size={18} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(cat)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all" title="Edit"><Edit size={18} /></button>
                              <button onClick={() => handleDelete(cat._id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                              <ChevronRight className="text-slate-200 dark:text-slate-700 group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <Layers size={64} className="mb-4 dark:text-white" />
                          <p className="text-xl font-bold dark:text-white">No categories found</p>
                          <p className="dark:text-slate-400">Try adjusting your search or add a new category.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      {/* <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-400 dark:text-slate-500 text-sm gap-4">
        <p>© 2026 Inventory Management System • Ver 2.4.0</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase font-bold tracking-widest text-xs">Support</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase font-bold tracking-widest text-xs">API Docs</a>
        </div>
      </div> */}
    </div>
  );
}