import React, { useState } from "react";
import { X, Send, User, Mail, MessageSquare } from "lucide-react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function AskQuestionModal({ onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/ask-question", {
        name,
        email,
        question
      });
      alert(t("questionSent"));
      onClose();
    } catch (err) {
      alert(t("questionFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all dark:bg-slate-900 dark:border dark:border-slate-800">

        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("askQuestionTitle")}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Fill out the form below and our team will get back to you shortly.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t("name")}
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all dark:bg-slate-800/50 dark:ring-slate-700 dark:text-white dark:placeholder-slate-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                placeholder={t("email")}
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all dark:bg-slate-800/50 dark:ring-slate-700 dark:text-white dark:placeholder-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Question Textarea */}
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <textarea
                rows="4"
                placeholder={t("yourInquiry")}
                className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all dark:bg-slate-800/50 dark:ring-slate-700 dark:text-white dark:placeholder-slate-500 resize-none"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 dark:bg-cyan-600 dark:hover:bg-cyan-500 shadow-lg shadow-cyan-900/10"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("submit")}</span>
                  <Send size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}