import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldQuestion } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email address.");

    setIsLoading(true);
    setError("");

    try {
      // Replace with your actual API endpoint
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 p-4 transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 mb-6">
                    <ShieldQuestion size={32} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                    Forgot <span className="text-blue-600 text-nowrap">Password?</span>
                  </h2>
                  <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                    No worries, we'll send you recovery instructions.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-medium"
                        required
                      />
                    </div>
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-500 font-bold ml-1">
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <a href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} />
                    Back to login
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-4"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">
                  Check Your <span className="text-emerald-500">Inbox</span>
                </h2>
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  We've sent a password recovery link to:<br />
                  <span className="text-slate-900 dark:text-white font-bold">{email}</span>
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 w-full py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Didn't get the email? Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}