import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChevronDown, FaGlobe, FaMoon, FaBell } from "react-icons/fa";
import ProfileDropdown from "../components/ProfileDropdown";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

      // Remove duplicates by _id
      const uniqueNotifications = Array.from(
        new Map((res.data.notifications || []).map((n) => [n._id, n])).values()
      );

      setNotifications(uniqueNotifications);
    } catch (error) {
      console.log("Notifications fetch error:", error);
      setNotifications([]);
    }
  };

  /* =============================
     HANDLE NOTIFICATION CLICK
  ============================== */
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axios.put(
          `http://localhost:5000/api/notification/${notif._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Mark all notifications with the same orderId as read
        setNotifications((prev) =>
          prev.map((n) =>
            n.orderId._id === notif.orderId._id ? { ...n, isRead: true } : n
          )
        );
      }

      // navigate with order id
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

  /* =============================
     SCROLL EFFECT
  ============================== */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const firstName = user?.fullname?.split(" ")[0] || "User";
  const firstLetter = firstName.charAt(0).toUpperCase();

  // Only count unseen notifications
  const unseenNotifications = notifications.filter((n) => !n.isRead);

  // Remove duplicate orders for dropdown display
  const uniqueUnseenNotifications = Array.from(
    new Map(unseenNotifications.map((n) => [n.orderId._id, n])).values()
  );

  const unreadCount = uniqueUnseenNotifications.length;

  return (
    <nav
      className={`sticky top-0 w-full transition-all duration-500 z-50 ${scrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm py-3"
        : "bg-white py-5"
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-1 cursor-pointer select-none"
        >
          <span
            className="text-3xl font-black text-slate-900"
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
          <div className="flex items-center w-full bg-gray-100 hover:bg-white px-6 py-3 rounded-3xl border border-gray-100 focus-within:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md">
            <FaSearch className="text-gray-400 mr-4 text-sm" />
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              className="bg-transparent w-full outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-5">
          {/* Language & Dark Mode */}
          <div className="hidden md:flex items-center gap-5 text-gray-400">
            <FaGlobe className="hover:text-orange-500 cursor-pointer transition" />
            <FaMoon className="hover:text-orange-500 cursor-pointer transition" />
          </div>

          {!token ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition"
              >
                Register
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-md"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="relative flex items-center gap-5">
              {/* NOTIFICATION ICON */}
              <div className="relative">
                <FaBell
                  className="text-gray-600 text-lg cursor-pointer hover:text-orange-500 transition"
                  onClick={() => setOpenNotif(!openNotif)}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}

                {/* Notification Dropdown */}
                {openNotif && (
                  <div className="absolute right-0 mt-2 w-90 max-h-96 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-lg z-50">
                    {uniqueUnseenNotifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-sm">No new notifications</p>
                    ) : (
                      uniqueUnseenNotifications.map((notif) => {
                        const formattedDate = new Date(
                          notif.createdAt
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });

                        // split the message
                        const messageParts = notif.message.split("has been delivered");

                        return (
                          <div
                            key={notif._id}
                            className="p-4 border-b border-gray-100 hover:bg-orange-50 transition-all flex gap-3"
                          >
                            {/* Notification Icon */}
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                              <FaBell className="text-orange-500 text-sm" />
                            </div>

                            {/* Message Content */}
                            <div className="flex flex-col flex-1">
                              {/* Main Message */}
                              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                {messageParts[0]}
                                <span className="text-emerald-600 font-semibold">
                                  has been delivered
                                </span>
                                .
                              </p>

                              {/* Review Link */}
                              <p className="text-sm mt-1">
                                Please write a review{" "}
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleNotificationClick(notif);
                                  }}
                                  className="text-blue-600 font-semibold hover:underline hover:text-blue-700"
                                >
                                  click here
                                </a>
                              </p>

                              {/* Date */}
                              <span className="text-xs text-gray-400 mt-1 font-medium">
                                {formattedDate}
                              </span>
                            </div>

                            {/* NEW Badge */}
                            {!notif.isRead && (
                              <span className="text-[10px] bg-red-500 text-white px-2 py-[2px] rounded-full h-fit">
                                NEW
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
                      Account
                    </p>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">
                      {firstName}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>

                  {/* PROFILE IMAGE */}
                  <div className="relative w-10 h-10">
                    {user?.profileImage ? (
                      <img
                        src={`http://localhost:5000${user.profileImage}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-2xl object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold">
                        {firstLetter}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  <FaChevronDown
                    className={`text-xs text-gray-400 transition-transform duration-300 ${openDropdown ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {openDropdown && (
                  <div className="absolute top-full right-0 mt-4 w-64">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
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