import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Save,
  Store,
  MapPin,
  Tag,
  FileText,
  Truck,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  Globe,
  Settings2,
  Bell,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
/**
 * RESTAURANT SETTINGS COMPONENT
 * Features: High-end UI, Image Preview, Bento-box layout, 
 * Real-time feedback, Dark Mode support, and Logic Preservation.
 */

const API_URL = "http://localhost:5000/api";

export default function RestaurantSettings() {
  // --- AUTH & CONTEXT LOGIC ---
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantId = storedUser?.restaurant?.restaurantId;

  // --- COMPONENT STATES ---
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    categories: "",
    description: "",
    deliveryFee: "",
    image: null,
  });

  /* ---------------- EFFECT: DATA INITIALIZATION ---------------- */
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurantId) {
        showStatus("error", t("settingss.errors.noId"));
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/restaurants/${restaurantId}`);
        const data = res.data;

        setFormData({
          name: data.name || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          categories: data.categories?.join(", ") || "",
          description: data.description || "",
          deliveryFee: data.deliveryFee || "",
          image: null,
        });

        if (data.image) {
          setPreview(`http://localhost:5000${data.image}`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        showStatus("error", t("settingss.errors.fetch")
        );
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId]);

  /* ---------------- LOGIC: HELPER FUNCTIONS ---------------- */

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: null, message: "" }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus("error", t("settings.errors.invalidImage"));
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  /* ---------------- LOGIC: FORM SUBMISSION ---------------- */

  const onFormSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("deliveryFee", formData.deliveryFee);
      data.append("categories", formData.categories);
      data.append("address[street]", formData.street);
      data.append("address[city]", formData.city);

      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await axios.put(
        `${API_URL}/restaurants/${restaurantId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        showStatus("success", t("settingss.success.update"));
      }
    } catch (err) {
      console.error("Update Error:", err);
      showStatus("error", t("settingss.errors.update"));
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- RENDER: LOADING STATE ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-xl"
        >
          <Loader2 className="w-10 h-10 text-yellow-500" />
        </motion.div>
        <h2 className="mt-6 font-bold text-gray-400 dark:text-slate-600 tracking-widest uppercase text-xs">{t("settingss.loading")}</h2>
      </div>
    );
  }

  /* ---------------- RENDER: MAIN UI ---------------- */
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 pb-24 font-sans bg-transparent transition-colors">

      {/* 1. TOP UTILITY BAR */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-gray-100 dark:border-slate-800 mb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Settings2 size={16} className="text-white dark:text-black" />
            </div>
            <span className="font-black text-sm tracking-tighter uppercase dark:text-white">{t("settingss.panel")}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 hidden md:block"></div>
            <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Bell size={20} /></button>
            <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              {preview && <img src={preview} alt="mini-avatar" className="w-full h-full object-cover" />}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* 2. HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <header>
            <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white transition-colors">{t("settingss.title")}</h1>
            <p className="text-gray-500 dark:text-slate-400 text-lg mt-2">{t("settingss.subtitle")}.</p>
          </header>
          <AnimatePresence>
            {status.type && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 ${status.type === "success"
                  ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400"
                  : "bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
                  } shadow-lg shadow-black/5`}
              >
                {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-black uppercase tracking-tight">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. MAIN FORM GRID */}
        <form onSubmit={onFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT COLUMN: BRANDING & PREVIEW */}
          <aside className="lg:col-span-4 space-y-8">

            {/* BRAND IMAGE SECTION */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors overflow-hidden relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-500">{t("settingss.brand")}</h3>
                <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400"><ImageIcon size={14} /></div>
              </div>

              <div
                onClick={() => fileInputRef.current.click()}
                className="group relative aspect-square rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all cursor-pointer"
              >
                {preview ? (
                  <img src={preview} alt="Restaurant brand" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-4"><Camera className="text-gray-300 dark:text-slate-600" /></div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center px-4">{t("settingss.upload")}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="px-4 py-2 bg-white dark:bg-slate-900 dark:text-white rounded-full text-xs font-black uppercase tracking-tighter">{t("settingss.upload")}</div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelection}
                className="hidden"
                accept="image/*"
              />

              <div className="mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/20">
                <div className="flex gap-3">
                  <Info className="text-yellow-600 dark:text-yellow-500 flex-shrink-0" size={16} />
                  <p className="text-[11px] text-yellow-800/70 dark:text-yellow-500/70 font-medium leading-relaxed">
                    {t("settingss.tip")}.
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK STATS / LIVE PREVIEW */}
            <section className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Store size={100} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-600 mb-8">{t("settingss.preview")}</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{t("settingss.preview")}</p>
                    <p className="text-2xl font-black truncate">{formData.name || t("settingss.setName")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{t("settingss.fee")}</p>
                      <p className="text-xl font-black text-yellow-400">Br {formData.deliveryFee || "0"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{t("settingss.region")}</p>
                      <p className="text-xl font-black">{formData.city || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* RIGHT COLUMN: CORE FIELDS */}
          <main className="lg:col-span-8 space-y-8">

            {/* BASE SETTINGS BOX */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50 dark:border-slate-800">
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight dark:text-white">{t("settingss.region")}</h2>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t("settingss.coreSub")}</p>
                </div>
              </div>

              <div className="grid gap-8">
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 group-focus-within:text-yellow-500 transition-colors">{t("settingss.name")}
                    </label>
                    <span className="text-[9px] text-gray-300 dark:text-slate-600 font-bold italic">{t("settingss.required")}</span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-yellow-400/5 focus:border-yellow-400 transition-all font-bold text-lg dark:text-white"
                    placeholder={t("settingss.namePlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 px-1">{t("settingss.about")}</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 rounded-[2rem] px-6 py-5 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-yellow-400 transition-all text-gray-700 dark:text-slate-300 leading-relaxed font-medium"
                    placeholder={t("settingss.descPlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* LOGISTICS & TAGS BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors group">
                <div className="flex items-center gap-3 mb-6">
                  <Tag size={18} className="text-yellow-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">{t("settingss.categories")}</h3>
                </div>
                <input
                  type="text"
                  name="categories"
                  value={formData.categories}
                  onChange={handleInputChange}
                  placeholder={t("settingss.categories")}
                  className="w-full bg-transparent border-b-2 border-gray-100 dark:border-slate-800 py-3 text-gray-800 dark:text-slate-200 font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-gray-200 dark:placeholder:text-slate-700"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.categories.split(',').filter(t => t.trim()).map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 text-[9px] font-black uppercase rounded-lg border border-gray-100 dark:border-slate-700">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <Truck size={18} className="text-yellow-500" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">{t("settingss.categoriesPlaceholder")}</h3>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-gray-200 dark:text-slate-800 mb-1 transition-colors">Br</span>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={formData.deliveryFee}
                    onChange={handleInputChange}
                    className="w-full bg-transparent py-1 text-4xl font-black text-gray-800 dark:text-white outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
                <p className="text-[9px] text-gray-300 dark:text-slate-600 font-bold uppercase mt-4 transition-colors">{t("settingss.deliveryNote")}</p>
              </div>
            </div>

            {/* LOCATION BOX */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-10">
                <MapPin size={20} className="text-red-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">{t("settingss.deliveryNote")}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 px-1">{t("settingss.location")}</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-yellow-400 transition-all font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-500 px-1">{t("settingss.street")}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-yellow-400 transition-all font-bold dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. ACTIONS BAR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 font-bold text-xs bg-gray-100/50 dark:bg-slate-900/50 px-6 py-3 rounded-full transition-colors">
                <Globe size={14} />
                {t("settingss.city")}
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-1/3 md:w-auto px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 dark:text-slate-600 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
                >
                  {t("settingss.sync")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 md:w-auto px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 dark:shadow-white/5 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={18} />
                      {t("settingss.reset")}
                    </div>
                  )}
                </button>
              </div>
            </div>

          </main>
        </form>

        {/* 5. FOOTER */}
        <footer className="mt-32 pt-12 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all">
          <div className="flex items-center gap-4">
            <h4 className="font-black tracking-tighter text-xl dark:text-white">MARAKI EATS</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-600">Merchant Dashboard v4.2</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-black dark:hover:text-white">{t("settingss.save")}</a>
            <a href="#" className="hover:text-black dark:hover:text-white">{t("settingss.terms")}</a>
          </div>
        </footer>

      </div>
    </div>
  );
}