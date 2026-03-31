import React, { useEffect, useState } from "react";
import {
  Plus, Edit, Trash2, Check, X,
  Layers, ChevronRight, Hash, Type,
  Tag, ListOrdered, Activity, Info,
  AlertCircle, Search, Filter
} from "lucide-react";
import { useTranslation } from "react-i18next";

const API_BASE_URL = "http://localhost:5000";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
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

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      triggerToast(t("fetchFailed") || "Failed to fetch", "error");
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
      triggerToast(t("categoryCreated") || "Category Created");
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
      triggerToast(t("updateSuccess") || "Updated Successfully");
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
      triggerToast(t("deleteSuccess") || "Deleted Successfully", "info");
    } catch (error) {
      triggerToast(t("deleteFailed") || "Delete Failed", "error");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium text-sm tracking-wide px-4 text-center">
          {t("initializingMenu") || "Initializing Menu"}...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-3 sm:p-6 md:p-8 lg:p-12 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Toast Notification - Improved for small screens */}
      {toast.show && (
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 md:right-10 z-[70] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 
          ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-slate-800 dark:bg-slate-700' : 'bg-emerald-600'} text-white`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span className="font-semibold text-xs sm:text-sm">{toast.message}</span>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <Layers className="text-indigo-600 dark:text-indigo-500 shrink-0" size={24} />
              <span className="truncate">{t("menuCategories") || "Menu Categories"}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px] sm:text-sm md:text-lg max-w-md">
              {t("organizeInventory") || "Organize your business inventory departments"}
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-xl font-bold shadow-lg transition-all
              ${showAddForm ? "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800" : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200/50"}`}
          >
            {showAddForm ? <X size={18} /> : <Plus size={18} />}
            <span className="text-sm">{showAddForm ? t("discardChanges") || "Discard" : t("createCategory") || "Create Category"}</span>
          </button>
        </div>

        {/* Stats Strip - Properly Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-6 sm:mt-8">
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0"><Layers size={18} /></div>
            <div className="min-w-0"><p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase truncate">{t("totalItems") || "Total"}</p><p className="text-base sm:text-2xl font-black dark:text-white leading-tight">{categories.length}</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0"><Activity size={18} /></div>
            <div className="min-w-0"><p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase truncate">{t("activeStatus") || "Status"}</p><p className="text-base sm:text-2xl font-black text-emerald-600 leading-tight">Live</p></div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0"><Filter size={18} /></div>
            <div className="min-w-0"><p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase truncate">{t("filtered") || "Results"}</p><p className="text-base sm:text-2xl font-black dark:text-white leading-tight">{filteredCategories.length}</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

        {/* ================= FORM (Mobile Toggle) ================= */}
        {showAddForm && (
          <div className="w-full lg:w-80 xl:w-[380px] shrink-0 animate-in slide-in-from-top lg:slide-in-from-left duration-300">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-bold mb-5 text-slate-800 dark:text-white">{t("newCategory") || "New Category"}</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                {[
                  { label: t("internalKey") || "Internal Key", key: "key", icon: <Hash size={14} />, placeholder: "e.g. HOT_DRINKS" },
                  { label: t("displayName") || "Display Name", key: "name", icon: <Type size={14} />, placeholder: "e.g. Hot Drinks" },
                  { label: t("localLabel") || "Local Label", key: "label", icon: <Tag size={14} />, placeholder: "e.g. መጠጦች" },
                  { label: t("iconName") || "Icon Key", key: "icon", icon: <Info size={14} />, placeholder: "cup, coffee" },
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                      {input.icon} {input.label}
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-sm dark:text-white"
                      placeholder={input.placeholder}
                      value={newCategory[input.key]}
                      onChange={(e) => setNewCategory(p => ({ ...p, [input.key]: e.target.value }))}
                      required={input.key === 'key' || input.key === 'name'}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                    <ListOrdered size={14} /> {t("priorityOrder") || "Priority Order"}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-sm dark:text-white"
                    value={newCategory.sortOrder}
                    onChange={(e) => setNewCategory(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 text-sm mt-2"
                >
                  <Plus size={18} /> {t("createDepartment") || "Create Department"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= CONTENT SIDE ================= */}
        <div className="grow space-y-4 w-full min-w-0">

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t("searchCategory") || "Search categories..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:border-indigo-500 outline-none text-sm dark:text-white"
            />
          </div>

          {/* Optimized Table Wrapper */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">

            {/* TABLE VIEW (Visible from tablet up) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("information") || "Information"}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("meta") || "Meta"}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{t("sequence") || "Order"}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredCategories.map((cat) => (
                    <tr key={cat._id} className="group hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10">
                      <td className="px-6 py-4">
                        {editingId === cat._id ? (
                          <div className="space-y-1.5">
                            <input className="w-full p-1.5 text-sm border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md outline-none dark:text-white" value={editCategory.name} onChange={(e) => setEditCategory(p => ({ ...p, name: e.target.value }))} />
                            <input className="w-full p-1 text-[10px] border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md outline-none text-slate-500" value={editCategory.key} onChange={(e) => setEditCategory(p => ({ ...p, key: e.target.value }))} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black">
                              {cat.icon ? <span className="text-lg uppercase">{cat.icon[0]}</span> : <Layers size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{cat.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 truncate uppercase">{cat.key}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === cat._id ? (
                          <div className="space-y-1.5">
                            <input className="w-full p-1.5 text-sm border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md outline-none" value={editCategory.label} onChange={(e) => setEditCategory(p => ({ ...p, label: e.target.value }))} />
                            <input className="w-full p-1.5 text-sm border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md outline-none" value={editCategory.icon} onChange={(e) => setEditCategory(p => ({ ...p, icon: e.target.value }))} />
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <p className="text-slate-600 dark:text-slate-300 text-xs truncate">{cat.label || "No Label"}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate"><Info size={10} /> {cat.icon || 'standard'}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === cat._id ? (
                          <input type="number" className="w-14 p-1.5 text-sm border dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-center outline-none" value={editCategory.sortOrder} onChange={(e) => setEditCategory(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs border dark:border-slate-700">{cat.sortOrder}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {editingId === cat._id ? (
                            <>
                              <button onClick={() => saveEdit(cat._id)} className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm"><Check size={14} /></button>
                              <button onClick={cancelEdit} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(cat)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"><Edit size={14} /></button>
                              <button onClick={() => handleDelete(cat._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW (Visible only on screens < 640px) */}
            <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                <div key={cat._id} className="p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-black">
                        {cat.icon ? <span className="text-lg uppercase">{cat.icon[0]}</span> : <Layers size={18} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{cat.name}</h3>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight truncate">{cat.key}</p>
                      </div>
                    </div>
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-bold border dark:border-slate-700">
                      {cat.sortOrder}
                    </span>
                  </div>

                  {editingId === cat._id ? (
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                      <input className="w-full p-2 text-xs border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none" value={editCategory.name} onChange={(e) => setEditCategory(p => ({ ...p, name: e.target.value }))} placeholder="Name" />
                      <input className="w-full p-2 text-xs border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none" value={editCategory.label} onChange={(e) => setEditCategory(p => ({ ...p, label: e.target.value }))} placeholder="Label" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(cat._id)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Check size={14} /> Save</button>
                        <button onClick={cancelEdit} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-2 rounded-lg text-xs font-bold" >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Translation</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{cat.label || "No Label"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(cat)} className="p-2.5 text-slate-400 hover:text-indigo-600 active:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(cat._id)} className="p-2.5 text-slate-400 hover:text-red-600 active:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="p-10 text-center opacity-40">
                  <Layers size={40} className="mx-auto mb-2 dark:text-white" />
                  <p className="text-sm font-bold dark:text-white">No Categories Found</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}