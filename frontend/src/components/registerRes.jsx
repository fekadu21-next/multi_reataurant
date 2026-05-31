import React, { useState } from "react";
import {
  FiArrowRight, FiArrowLeft, FiMapPin, FiLock,
  FiCheckCircle, FiUpload, FiPhone, FiMail, FiInfo,
  FiShoppingBag, FiMenu, FiBarChart2, FiUsers
} from "react-icons/fi";
import axios from "axios";

const API_URL = "https://multi-reataurant-1.onrender.com";

export default function RegisterRes({ onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form Field State Management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cuisineType: "",
    description: "",
    street: "",
    city: "Addis Ababa",
    subCity: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.cuisineType) {
        setError("Please complete all required business metrics.");
        return;
      }
    } else if (step === 2) {
      if (!formData.street || !formData.subCity) {
        setError("Please supply exact location parameters for your cloud kitchen dispatch points.");
        return;
      }
    }
    setError("");
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = (e) => {
    if (e) e.preventDefault();
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Credentials mismatch. Please verify passwords match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Security requirement: Passwords must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cuisineType: formData.cuisineType,
        description: formData.description,
        address: {
          street: formData.street,
          city: formData.city,
          subCity: formData.subCity
        },
        password: formData.password
      };

      const response = await axios.post(`${API_URL}/api/restaurants/register`, payload);

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
          window.location.href = "/login";
        }, 2000);
      }
    } catch (err) {
      console.error("Merchant onboarding error:", err);
      setError(err.response?.data?.message || "Internal server error. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-slate-800 overflow-hidden relative z-10 flex flex-col md:flex-row min-h-[580px]">

      {/* Left Aspect Banner */}
      <div className="w-full md:w-[40%] bg-slate-950 p-8 md:p-10 text-white flex flex-col justify-between relative bg-gradient-to-br from-slate-900 to-black border-r border-slate-800">
        <div className="space-y-6">
          <div className="text-xl font-black tracking-tight text-orange-500 cursor-pointer" onClick={() => { if (onClose) onClose(); }}>
            Maraki<span className="text-white">Eats</span>
          </div>
          <div className="space-y-2 pt-4">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">Merchant Onboarding</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none">Partner Registration</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Unlock digital marketplace access. Control menus, track automated payments, and scale logistics instantly across Addis.
            </p>
          </div>
        </div>

        {/* Stepper Progress Markers */}
        <div className="hidden md:flex flex-col gap-6 my-8 relative z-10">
          {[
            { num: 1, title: "Business Metrics", desc: "Basic metadata" },
            { num: 2, title: "Kitchen Dispatch", desc: "Location parameters" },
            { num: 3, title: "Security Protocols", desc: "Manager access keys" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all ${step === s.num
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider ${step === s.num ? "text-orange-400" : "text-gray-300"}`}>{s.title}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          © 2026 Maraki Eats Network
        </div>
      </div>

      {/* Right Aspect Form Workspace */}
      <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">

        {success ? (
          <div className="text-center space-y-4 py-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiCheckCircle size={38} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Registration Submitted</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
              Your cloud storefront registry was processed successfully. Redirecting you to login portal credentials...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wide rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
                <FiInfo size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                <div className="space-y-0.5 mb-4">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <FiShoppingBag className="text-orange-500" /> Business Metrics
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Configure your public visibility identities.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Restaurant Name *</label>
                  <div className="relative">
                    <FiShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Bait Al Mandi Addis"
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Official Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="contact@kitchen.com"
                        className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Dispatch Hotline Mobile *</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+251 9..."
                        className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Primary Cuisine Type *</label>
                  <select
                    name="cuisineType" required value={formData.cuisineType} onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    <option value="" disabled>Select culinary specialty classification</option>
                    <option value="Traditional Ethiopian">Traditional Ethiopian (ክትፎ, በየአይነቱ)</option>
                    <option value="Continental / Western">Continental / Western Burgers & Pizza</option>
                    <option value="Middle Eastern">Middle Eastern Mandi & Shawarma</option>
                    <option value="Desserts & Beverages">Desserts, Cakes & Beverages</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Storefront Summary (Optional)</label>
                  <textarea
                    name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Describe your kitchen highlights..."
                    className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-3.5 animate-in fade-in duration-300">
                <div className="space-y-0.5 mb-4">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <FiMapPin className="text-orange-500" /> Dispatch Base
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Pin down operational addresses for delivery dispatches.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Base Hub</label>
                    <input
                      type="text" name="city" readOnly value={formData.city}
                      className="w-full bg-gray-100 dark:bg-slate-800/20 text-gray-400 border border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Sub-City District *</label>
                    <input
                      type="text" name="subCity" required value={formData.subCity} onChange={handleChange} placeholder="e.g. Bole / Kirkos"
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Street Line / Landmarks *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text" name="street" required value={formData.street} onChange={handleChange} placeholder="e.g. Cameroon Rd, Next to Edna Mall"
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="border border-dashed border-gray-200 dark:border-slate-800 rounded-xl p-5 text-center text-slate-400 hover:text-orange-500 transition-colors cursor-pointer group bg-slate-50/50 dark:bg-transparent">
                    <FiUpload size={20} className="mx-auto mb-1.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Upload Business License (Optional)</h5>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">PDF, PNG or JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in duration-300">
                <div className="space-y-0.5 mb-4">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <FiLock className="text-orange-500" /> Access Credentials
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Establish authorization credentials for your login panel.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Security Password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Verify Password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2.5 pt-1">
                  <input type="checkbox" required id="terms" className="mt-1 accent-orange-500 w-3.5 h-3.5 cursor-pointer" />
                  <label htmlFor="terms" className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-normal cursor-pointer select-none">
                    I endorse platform metrics and verify that all data submitted conforms to standards.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-slate-800/60 mt-6">
                  <button
                    type="button" onClick={handlePrevStep}
                    className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-slate-900 dark:text-slate-100"
                  >
                    <FiArrowLeft /> Back
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    {loading ? "Processing..." : "Complete Onboarding"}
                  </button>
                </div>
              </form>
            )}

            {/* Stepper Controls Footer */}
            {step < 3 && (
              <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-slate-800/60">
                {step > 1 ? (
                  <button
                    type="button" onClick={handlePrevStep}
                    className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-slate-900 dark:text-slate-100"
                  >
                    <FiArrowLeft /> Back
                  </button>
                ) : (
                  <button
                    type="button" onClick={onClose}
                    className="flex items-center gap-1.5 px-4 py-3 text-gray-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button" onClick={handleNextStep}
                  className="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all ml-auto"
                >
                  Next Step <FiArrowRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}