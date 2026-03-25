import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import translations
import en from "./locales/en.json";
import am from "./locales/am.json";

// ✅ Get saved language from localStorage, default to "en"
const savedLang = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am }
    },
    lng: savedLang, // ✅ load saved language on init
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;