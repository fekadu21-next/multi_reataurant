// src/pages/account/AccountSettingsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const API = "http://localhost:5000/api/user";

const AccountSettingsPage = () => {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    fullname: "",
    email: "",
    address: {
      phone: "",
      street: "",
      city: "",
    },
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // UI State for password toggle
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // ===============================
  // Fetch User Info
  // ===============================
  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data.user;

      setUser({
        fullname: userData.fullname || "",
        email: userData.email || "",
        address: {
          phone: userData.address?.phone || "",
          street: userData.address?.street || "",
          city: userData.address?.city || "",
        },
      });

      setProfileImage(userData.profileImage || null);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // Update Profile Info
  // ===============================
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage(null);

      await axios.put(`${API}/settings`, user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Update Profile Image
  // ===============================
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await axios.put(
        `${API}/settings/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedUser = res.data.user;

      setProfileImage(updatedUser.profileImage);

      // update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          profileImage: updatedUser.profileImage,
        })
      );

      setMessage({ type: "success", text: "Profile photo updated" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to upload image",
      });
    }
  };

  // ===============================
  // Change Password
  // ===============================
  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setMessage(null);

      await axios.put(`${API}/settings/password`, passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPasswords({ oldPassword: "", newPassword: "" });
      setMessage({ type: "success", text: "Password changed successfully" });
      setShowPasswordSection(false); // Hide after success
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="mt-2 text-gray-500">Manage your profile information and security preferences.</p>
        </div>

        {/* Global Message Notification */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
          >
            <div className={`p-1 rounded-full ${message.type === "success" ? "bg-emerald-200" : "bg-rose-200"}`}>
              {message.type === "success" ? <ShieldCheck size={18} /> : <Lock size={18} />}
            </div>
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10">
              {/* Profile Image Section */}
              <div className="relative group mx-auto md:mx-0">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100 flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={`http://localhost:5000${profileImage}`}
                      alt="Profile"
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-emerald-600 uppercase">
                      {user.fullname?.charAt(0)}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors duration-200 text-emerald-600">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{user.fullname || "User Name"}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={user.fullname}
                  onChange={(e) => setUser({ ...user, fullname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                  placeholder="john@example.com"
                />
              </div>

              {/* Address Section */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={14} /> Contact & Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={user.address.phone}
                      onChange={(e) => setUser({ ...user, address: { ...user.address, phone: e.target.value } })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={user.address.street}
                      onChange={(e) => setUser({ ...user, address: { ...user.address, street: e.target.value } })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={user.address.city}
                      onChange={(e) => setUser({ ...user, address: { ...user.address, city: e.target.value } })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="group relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "Saving Changes..." : <><Save size={18} /> Update Profile</>}
              </button>
            </div>
          </div>
        </div>

        {/* Security / Password Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center gap-4 text-gray-800">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-bold">Security Settings</h3>
                <p className="text-xs text-gray-500">Change your password and manage account security</p>
              </div>
            </div>
            {showPasswordSection ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
          </button>

          {showPasswordSection && (
            <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;