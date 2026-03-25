import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChevronDown, FaGlobe, FaMoon, FaSun, FaBell } from "react-icons/fa";
import ProfileDropdown from "../components/ProfileDropdown";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openLang, setOpenLang] = useState(false); // ✅ added state for language dropdown

  const token = localStorage.getItem("token");

  /* =============================
      FETCH USER FROM BACKEND
  ============================== */
  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (error) {
      console.log("User fetch error:", error);
    }
  };

  /* =============================
      FETCH USER NOTIFICATIONS
  ============================== */
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notification", {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" },
      });

      const uniqueNotifications = Array.from(
        new Map((res.data.notifications || []).map((n) => [n._id, n])).values()
      );

      setNotifications(uniqueNotifications);
    } catch (error) {
      console.log("Notifications fetch error:", error);
      setNotifications([]);
    }
  };
  // add inside Navbar component
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);           // change language
    localStorage.setItem("i18nextLng", lang); // persist selection
    setOpenLang(false);                  // close dropdown
  };
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(
          `http://localhost:5000/api/notification/${notif._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications((prev) =>
          prev.map((n) =>
            n.orderId._id === notif.orderId._id ? { ...n, isRead: true } : n
          )
        );
      }
      navigate(`/account/myorders?orderId=${notif.orderId._id}`);
      setOpenNotif(false);
    } catch (error) {
      console.log("Error marking notification read:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const firstName = user?.fullname?.split(" ")[0] || "User";
  const firstLetter = firstName.charAt(0).toUpperCase();
  const unseenNotifications = notifications.filter((n) => !n.isRead);
  const uniqueUnseenNotifications = Array.from(
    new Map(unseenNotifications.map((n) => [n.orderId._id, n])).values()
  );
  const unreadCount = uniqueUnseenNotifications.length;

  return (
    <nav
      className={`sticky top-0 w-full transition-all duration-500 z-50 ${scrolled
        ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm py-3"
        : "bg-white dark:bg-slate-950 py-5"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-1 cursor-pointer select-none"
        >
          <span
            className="text-3xl font-black text-slate-900 dark:text-white"
            style={{ fontFamily: "'Abyssinica SIL', serif" }}
          >
            ማራኪ
          </span>
          <span
            className="text-orange-500 text-2xl"
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Eats
          </span>
        </div>

        {/* SEARCH BAR */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-16">
          <div className="flex items-center w-full bg-gray-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 px-6 py-3 rounded-3xl border border-gray-100 dark:border-slate-700 focus-within:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md">
            <FaSearch className="text-gray-400 mr-4 text-sm" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="bg-transparent w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5 text-gray-400">
            <div className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="group flex items-center justify-center p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-300"
              >
                <FaGlobe className={`text-lg transition-colors duration-300 ${openLang ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-orange-500'}`} />
              </button>

              {/* MODERN LANGUAGE DROPDOWN */}
              {openLang && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setOpenLang(false)} />

                  <div className="absolute right-0 mt-3 w-48 origin-top-right bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1.5 space-y-1">
                      {/* English Option */}
                      <button
                        onClick={() => changeLanguage("en")}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group 
              ${i18n.language === "en"
                            ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600">
                            EN
                          </span>
                          <span className="text-sm font-semibold">English</span>
                        </div>
                        {i18n.language === "en" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        )}
                      </button>

                      {/* Amharic Option */}
                      <button
                        onClick={() => changeLanguage("am")}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group 
              ${i18n.language === "am"
                            ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600">
                            አማ
                          </span>
                          <span className="text-sm font-semibold">አማርኛ</span>
                        </div>
                        {i18n.language === "am" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative group flex items-center">
              {darkMode ? (
                <FaSun
                  onClick={toggleTheme}
                  className="hover:text-orange-500 cursor-pointer transition text-yellow-400"
                />
              ) : (
                <FaMoon
                  onClick={toggleTheme}
                  className="hover:text-orange-500 cursor-pointer transition text-gray-500"
                />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-800 dark:bg-orange-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {darkMode ? t("lightMode") : t("darkMode")}
              </span>
            </div>
          </div>

          {!token ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                {t("register")}
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-md"
              >
                {t("signIn")}
              </button>
            </div>
          ) : (
            <div className="relative flex items-center gap-5">
              {/* NOTIFICATION ICON */}
              <div className="relative">
                <FaBell
                  className="text-gray-600 dark:text-gray-400 text-lg cursor-pointer hover:text-orange-500 transition"
                  onClick={() => setOpenNotif(!openNotif)}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}

                {openNotif && (
                  <div className="absolute right-0 mt-4 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                    {uniqueUnseenNotifications.length === 0 ? (
                      <p className="p-4 text-gray-500 dark:text-gray-400 text-sm">{t("noNotifications")}</p>
                    ) : (
                      uniqueUnseenNotifications.map((notif) => {
                        const formattedDate = new Date(notif.createdAt).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        });
                        const messageParts = notif.message.split("has been delivered");

                        return (
                          <div
                            key={notif._id}
                            className="p-4 border-b border-gray-100 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-slate-800/50 transition-all flex gap-3"
                          >
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <FaBell className="text-orange-500 text-sm" />
                            </div>
                            <div className="flex flex-col flex-1">
                              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                                {messageParts[0]}
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  has been delivered
                                </span>.
                              </p>
                              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                {t("writeReview")}{" "}
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNotificationClick(notif);
                                  }}
                                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                  {t("clickHere")}
                                </a>
                              </p>
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                                {formattedDate}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <span className="text-[10px] bg-red-500 text-white px-2 py-[2px] rounded-full h-fit">
                                {t("new")}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* PROFILE */}
              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold leading-none">
                      {t("account")}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                      {firstName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
                  </div>

                  <div className="relative w-10 h-10">
                    {user?.profileImage ? (
                      <img
                        src={`http://localhost:5000${user.profileImage}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-2xl object-cover border border-gray-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold">
                        {firstLetter}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                  </div>

                  <FaChevronDown
                    className={`text-xs text-gray-400 transition-transform duration-300 ${openDropdown ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {openDropdown && (
                  <div className="absolute top-full right-0 mt-4 w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                      <ProfileDropdown
                        user={user}
                        onClose={() => setOpenDropdown(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;