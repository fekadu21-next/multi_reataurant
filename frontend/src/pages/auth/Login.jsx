import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    console.log("LOGIN CLICKED");
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("FULL LOGIN RESPONSE:", data);
      console.log("USER OBJECT:", data.user);
      console.log("RESTAURANT:", data.user?.restaurant);
      console.log("IMAGE:", data.user?.restaurant?.image);
      if (!res.ok) {
        setMessage(data.message || t("loginFailed"));
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else if (data.user.role === "restaurant_owner") {
          window.location.href = "/restaurant-dashboard";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setMessage(t("somethingWentWrong"));
    }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center px-4 transition-colors duration-300 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("login")}
          </h2>
        </div>

        {/* Error Message */}
        {message && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center text-red-600 dark:text-red-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link - Positioned clearly below input */}
            <div className="flex justify-end px-1">
              <a
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {t("forgotPassword") || "Forgot Password?"}
              </a>
            </div>
          </div>

          {/* Buttons Side by Side */}
          <div className="flex flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="animate-spin w-5 h-5" />}
              {loading ? t("loggingIn") : t("login")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}