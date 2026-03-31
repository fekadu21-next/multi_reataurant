import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaChevronDown, FaGlobe, FaMoon, FaSun, FaBell } from "react-icons/fa";
import ProfileDropdown from "../components/ProfileDropdown";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access current URL
  const { t, i18n } = useTranslation();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openLang, setOpenLang] = useState(false);

  // Search State synced with URL
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  /* =============================
      SEARCH LOGIC
  ============================== */
  // Sync the input field with the URL parameter (useful for back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const params = new URLSearchParams(location.search);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    // Navigate to homepage with the search query if not already there, 
    // or just update parameters if already on home.
    navigate({
      pathname: "/",
      search: params.toString(),
    }, { replace: true });
  };

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

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
    setOpenLang(false);
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
        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-md py-2"
        : "bg-white dark:bg-slate-950 py-4"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between gap-3">

          {/* --- LOGO --- */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-1 cursor-pointer select-none shrink-0"
          >
            <span
              className="text-xl md:text-3xl font-black text-slate-900 dark:text-white"
              style={{ fontFamily: "'Abyssinica SIL', serif" }}
            >
              ማራኪ
            </span>
            <span
              className="text-orange-500 text-lg md:text-2xl"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Eats
            </span>
          </div>

          {/* --- DESKTOP SEARCH BAR (Only LG screen) --- */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="flex items-center w-full bg-gray-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 px-5 py-2.5 rounded-2xl border border-gray-100 dark:border-slate-700 focus-within:border-orange-300 transition-all duration-300">
              <FaSearch className="text-gray-400 mr-3 text-sm" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("searchPlaceholder")}
                className="bg-transparent w-full outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* --- RIGHT SIDE ACTIONS --- */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Language Selection */}
            <div className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all"
              >
                <FaGlobe className={`text-lg ${openLang ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'}`} />
              </button>

              {openLang && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenLang(false)} />
                  <div className="absolute right-0 mt-3 w-40 origin-top-right bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={() => changeLanguage("en")}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${i18n.language === "en" ? "bg-orange-50 text-orange-600" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        English {i18n.language === "en" && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </button>
                      <button
                        onClick={() => changeLanguage("am")}
                        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${i18n.language === "am" ? "bg-orange-50 text-orange-600" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        አማርኛ {i18n.language === "am" && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all"
            >
              {darkMode ? <FaSun className="text-yellow-400 text-lg" /> : <FaMoon className="text-slate-500 text-lg" />}
            </button>

            {/* --- AUTH BUTTONS (REGISTER & SIGN IN) --- */}
            {!token ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/register")}
                  className="px-2.5 md:px-5 py-2 md:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs md:text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  {t("register")}
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="px-3 md:px-6 py-2 md:py-2.5 rounded-xl bg-orange-500 text-white text-xs md:text-sm font-bold hover:bg-orange-600 transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  {t("signIn")}
                </button>
              </div>
            ) : (
              /* --- LOGGED IN USER SECTION --- */
              <div className="flex items-center gap-2 md:gap-5">
                {/* Notifications Bell */}
                <div className="relative">
                  <div
                    className="p-2 md:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer relative transition-all"
                    onClick={() => setOpenNotif(!openNotif)}
                  >
                    <FaBell className="text-slate-600 dark:text-slate-400 text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {openNotif && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenNotif(false)} />
                      <div className="absolute right-[-40px] md:right-0 mt-4 w-[280px] md:w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50">
                        {uniqueUnseenNotifications.length === 0 ? (
                          <p className="p-6 text-gray-500 dark:text-gray-400 text-sm text-center font-medium">{t("noNotifications")}</p>
                        ) : (
                          uniqueUnseenNotifications.map((notif) => (
                            <div key={notif._id} className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <FaBell className="text-orange-500 text-xs" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug">
                                  {notif.message.split("has been delivered")[0]} <span className="text-emerald-500 font-bold">delivered</span>.
                                </p>
                                <button
                                  onClick={() => handleNotificationClick(notif)}
                                  className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 hover:underline"
                                >
                                  {t("clickHere")}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Profile Section */}
                <div className="relative">
                  <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setOpenDropdown(!openDropdown)}
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold leading-none">{t("account")}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                        {firstName}
                      </p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 relative">
                      {user?.profileImage ? (
                        <img
                          src={`http://localhost:5000${user.profileImage}`}
                          alt="Profile"
                          className="w-full h-full rounded-xl md:rounded-2xl object-cover border border-gray-200 dark:border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl md:rounded-2xl bg-orange-500 flex items-center justify-center text-white font-extrabold shadow-sm">
                          {firstLetter}
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                  </div>

                  {openDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(false)} />
                      <div className="absolute top-full right-0 mt-4 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                          <ProfileDropdown user={user} onClose={() => setOpenDropdown(false)} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- MOBILE SEARCH BAR (Visible below main row on Mobile) --- */}
        <div className="mt-3 lg:hidden">
          <div className="flex items-center w-full bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-transparent focus-within:border-orange-300 focus-within:bg-white dark:focus-within:bg-slate-700 transition-all duration-300">
            <FaSearch className="text-gray-400 mr-3 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t("searchPlaceholder")}
              className="bg-transparent w-full outline-none text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;