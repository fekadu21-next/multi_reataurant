import { useEffect, useState } from "react";
import axios from "axios";
import { Camera, Lock, User, Mail, Save, Key, ShieldCheck, ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
const API = "http://localhost:5000/api/user";

export default function ProfileSettings() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.user;
      const nameParts = user.fullname?.split(" ") || [];
      setForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      });
      setPreview(user.profileImage || "");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      const res = await axios.put(`${API}/settings/profile-image`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data.user.profileImage);
    } catch (err) {
      alert(t("uploadFailed"));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const fullname = `${form.firstName} ${form.lastName}`;
      await axios.put(`${API}/settings`, { fullname, email: form.email }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(t("profileUpdated"));
    } catch (err) {
      alert(t("updateFailed"));
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) return;
    try {
      await axios.put(`${API}/settings/password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(t("passwordUpdated"));
      setPasswordData({ oldPassword: "", newPassword: "" });
      setShowPasswordSection(false);
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950">
      <div className="w-48 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="w-24 h-full bg-indigo-600 animate-infinite-scroll"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{t("loading")}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900/40 dark:to-transparent -z-10" />

      <div className="max-w-5xl mx-auto pt-16 pb-20 px-4">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white">
            <h1 className="text-4xl font-bold tracking-tight">{t("profileSettings")}</h1>
            <p className="text-indigo-100/80 mt-2">{t("manageAccount")}.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs border border-white/20">
              {t("systemOnline")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Card */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
                  <img
                    src={preview ? `http://localhost:5000${preview}` : "https://via.placeholder.com/150"}
                    alt="User"
                    className="relative w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-2xl"
                  />
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-2xl cursor-pointer shadow-xl transition-transform hover:scale-110 active:scale-90">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="mt-6 text-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{form.firstName} {form.lastName}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{form.email}</p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">{t("accountStatus")}</span>
                    <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">{t("active")}</span>
                  </div>
                  {/* <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Role</span>
                    <span className="text-slate-900 dark:text-slate-200 font-semibold">Administrator</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Info Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600">
                    <User size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{t("publicProfile")}</h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("firstName")}</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("lastName")}</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("emailAddress")}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    className="group bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5"
                  >
                    <Save size={18} />
                    {t("emailAddress")}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-1 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{t("synchronizeProfile")}</h3>
                </div>
                {!showPasswordSection && (
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                  >
                    {t("change")} <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {showPasswordSection && (
                <div className="p-8 pt-0 space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("oldPassword")}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("newPassword")}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleChangePassword}
                      className="bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all hover:opacity-90"
                    >
                      <Key size={18} />
                      {t("updateCredentials")}
                    </button>
                    <button
                      onClick={() => setShowPasswordSection(false)}
                      className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}