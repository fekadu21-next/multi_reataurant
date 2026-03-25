// src/components/ProfileDropdown.jsx
import { FaClipboardList, FaHeart, FaUserCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ProfileDropdown = ({ user, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const { t } = useTranslation();
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setLocalUser(updatedUser);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  const fullName = localUser?.fullname || t("userDefault");
  const firstName = fullName.trim().split(" ")[0];
  const firstLetter = firstName.charAt(0).toUpperCase();

  const profileImageUrl =
    localUser?.profileImage?.startsWith("http")
      ? localUser.profileImage
      : localUser?.profileImage
        ? `http://localhost:5000${localUser.profileImage}`
        : null;

  // Reusable component for menu items
  const MenuItem = ({ icon: Icon, label, onClick, variant = "default" }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all duration-200 group
        ${variant === "danger"
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        }`}
    >
      <div className={`p-2 rounded-lg transition-colors 
        ${variant === "danger"
          ? "bg-red-50 dark:bg-red-500/10 group-hover:bg-red-100"
          : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
        }`}>
        <Icon size={16} />
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-72 origin-top-right bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* User Header Section */}
      <div className="relative overflow-hidden px-5 py-6 border-b border-slate-100 dark:border-slate-800">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="profile"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-md"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
                {firstLetter}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate">
              {fullName}
            </h4>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
              {localUser?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-2 space-y-0.5">
        <MenuItem
          icon={FaClipboardList}
          label={t("myOrders")}
          onClick={() => handleNavigate("/account/myorders")}
        />
        <MenuItem
          icon={FaHeart}
          label={t("favorites")}
          onClick={() => handleNavigate("/account/favorites")}
        />
        <MenuItem
          icon={FaUserCog}
          label={t("accountSettings")}
          onClick={() => handleNavigate("/account")}
        />
      </div>

      {/* Footer / Logout */}
      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <MenuItem
          icon={FaSignOutAlt}
          label={t("logout")}
          onClick={handleLogout}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default ProfileDropdown;