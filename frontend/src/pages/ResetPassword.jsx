import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Link expired or invalid token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-4 transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Brand/Icon Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-6 shadow-xl rotate-3">
                    <KeyRound size={36} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-tight">
                    Secure <span className="text-blue-600">Vault</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                    Update your credentials
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Identity</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold"
                    >
                      <AlertCircle size={16} />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Authorize Change"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border-4 border-emerald-500/20">
                    <CheckCircle2 size={56} strokeWidth={1.5} />
                  </div>
                </div>

                <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-tight">
                  Vault <span className="text-emerald-500">Updated</span>
                </h2>
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Your new credentials have been authorized. Redirecting to terminal...
                </p>

                <div className="mt-10 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}