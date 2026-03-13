// src/components/ProfileDropdown.jsx
import { FaClipboardList, FaHeart, FaUserCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const ProfileDropdown = ({ user, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const [localUser, setLocalUser] = useState(user);

  // Update dropdown when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setLocalUser(updatedUser);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
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

  // Get first name from fullname
  const fullName = localUser?.fullname || "User";
  const firstName = fullName.trim().split(" ")[0];
  const firstLetter = firstName.charAt(0).toUpperCase();

  // Handle profile image path (full URL or relative)
  const profileImageUrl =
    localUser?.profileImage?.startsWith("http")
      ? localUser.profileImage
      : localUser?.profileImage
        ? `http://localhost:5000${localUser.profileImage}`
        : null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden animate-fadeIn"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 border-b">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#2A5248] flex items-center justify-center text-white text-lg font-semibold">
            {firstLetter}
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-800">{firstName}</p>
          <p className="text-xs text-gray-500 truncate w-40">{localUser?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="py-2">
        <button onClick={() => handleNavigate("/account/myorders")} className="menu-item">
          <FaClipboardList />
          <span>My Orders</span>
        </button>

        <button onClick={() => handleNavigate("/account/favorites")} className="menu-item">
          <FaHeart />
          <span>Favorites</span>
        </button>

        <button onClick={() => handleNavigate("/account")} className="menu-item">
          <FaUserCog />
          <span>Account Settings</span>
        </button>
      </div>

      <div className="border-t">
        <button onClick={handleLogout} className="menu-item text-red-600 hover:bg-red-50">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      <style>
        {`
          .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 20px;
            font-size: 14px;
            color: #374151;
            transition: background 0.2s ease;
          }
          .menu-item:hover {
            background: #f3f4f6;
          }
          .animate-fadeIn {
            animation: fadeIn 0.15s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ProfileDropdown;