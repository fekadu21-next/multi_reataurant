import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || t("registrationFailed"));
      } else {
        setMessage(t("registrationSuccess"));
        setFullname("");
        setEmail("");
        setPassword("");
        // Optional: Redirect after success
        // setTimeout(() => navigate("/login"), 2000);
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
            {t("register")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">

          </p>
        </div>

        {/* Message (Success or Error) */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg border text-center text-sm ${message === t("registrationSuccess")
            ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
            : "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name Field */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("fullName")}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

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
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          {/* Buttons - Horizontal Alignment */}
          <div className="flex flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 className="animate-spin w-5 h-5" />}
              {loading ? t("registering") : t("register")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-3 px-4 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}