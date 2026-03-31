import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000";

export default function SystemSettings() {
  const { t } = useTranslation(); // Added i18n hook
  const [shippingOptions, setShippingOptions] = useState([]);
  const [commissionPercent, setCommissionPercent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/shipping`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setShippingOptions(res.data.shippingOptions || []);
        setCommissionPercent(res.data.commissionPercent || 0);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setShippingOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (index, field, value) => {
    const updated = [...shippingOptions];
    updated[index] = { ...updated[index], [field]: value };
    setShippingOptions(updated);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/shipping`,
        {
          shippingOptions,
          commissionPercent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(t("settingsUpdated")); // Localized
    } catch (err) {
      console.error("Update failed:", err);
      alert(t("updateFailed")); // Localized
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight">
        {t("systemSettings")} {/* Localized */}
      </h2>

      {/* Commission */}
      <div className="mb-8">
        <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
          {t("platformCommission")} (%) {/* Localized */}
        </label>
        <input
          type="number"
          value={commissionPercent}
          onChange={(e) => setCommissionPercent(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none transition-all font-bold"
          placeholder={t("commissionExample")} // Localized placeholder
        />
      </div>

      {/* Shipping Options */}
      <div>
        <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-4">
          {t("shippingRates")} {/* Localized */}
        </h3>

        {shippingOptions?.length > 0 ? (
          shippingOptions.map((option, index) => (
            <div
              key={option.type || index}
              className="p-5 rounded-2xl mb-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
            >
              <p className="font-black text-indigo-600 dark:text-indigo-400 text-xs uppercase mb-4 tracking-tighter">
                {option.type} {t("service")} {/* Localized */}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {t("displayName")} {/* Localized */}
                  </label>
                  <input
                    type="text"
                    value={option.name || ""}
                    onChange={(e) =>
                      handleShippingChange(index, "name", e.target.value)
                    }
                    className="w-full bg-white dark:bg-slate-900 border-none p-3 rounded-xl dark:text-white outline-none font-bold text-sm"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {t("feeETB")} {/* Localized */}
                  </label>
                  <input
                    type="number"
                    value={option.price || 0}
                    onChange={(e) =>
                      handleShippingChange(index, "price", e.target.value)
                    }
                    className="w-full bg-white dark:bg-slate-900 border-none p-3 rounded-xl dark:text-white outline-none font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-400 font-bold text-sm">{t("noShippingOptions")}</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-sm"
      >
        {t("saveSettings")} {/* Localized */}
      </button>
    </div>
  );
}