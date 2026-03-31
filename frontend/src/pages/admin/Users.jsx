import React, { useState, useEffect } from "react";
import {
  FiTrash2, FiUserPlus, FiEdit, FiSearch,
  FiFilter, FiX, FiCheck, FiMoon, FiSun, FiUsers, FiMail, FiShield
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const API_URL = "http://localhost:5000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [newUser, setNewUser] = useState({ fullname: "", email: "", password: "", role: "" });
  const [editUser, setEditUser] = useState({ fullname: "", email: "", role: "" });
  const { t } = useTranslation();

  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  //   document.documentElement.classList.toggle('dark');
  // };

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast(t("fetchError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, data.user]);
        showToast(t("userCreated"));
        setShowAddModal(false);
        setNewUser({ fullname: "", email: "", password: "", role: "" });
      } else {
        showToast(data.message || "Registration failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setEditUser({ fullname: u.fullname, email: u.email, role: u.role });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map((u) => (u._id === data.user._id ? data.user : u)));
        showToast("User updated successfully!");
        setShowEditModal(false);
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/auth/users/${selectedUser._id}`, { method: "DELETE" });
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      showToast("User removed", "info");
      setShowDeleteModal(false);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-500 animate-pulse font-medium">Synchronizing directory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 transition-colors duration-300">

      {/* Toast Notification - Responsive Width */}
      {message.text && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-auto z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top md:slide-in-from-right duration-300 text-white ${message.type === 'error' ? 'bg-red-500' : message.type === 'info' ? 'bg-slate-800' : 'bg-emerald-500'}`}>
          {message.type === 'error' ? <FiX /> : <FiCheck />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white"><FiUsers size={24} /></div>
              {t("userManagement")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">{t("manageMembers")}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* <button
              onClick={toggleDarkMode}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button> */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-grow sm:flex-grow-0 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none font-bold transition-all active:scale-95 text-sm sm:text-base"
            >
              <FiUserPlus /> {t("addNewMember")}
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 mb-8">
          <div className="relative flex-grow group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={t("searchPlaceholders")}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm sm:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative md:w-64 group">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <select
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all dark:text-white text-sm sm:text-base"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">{t("allPermissions")}</option>
              <option value="customer">{t("customer")}</option>
              <option value="restaurant_owner">{t("restaurantOwner")}</option>
              <option value="admin">{t("administrator")}</option>
            </select>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">

          {/* Desktop Table - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-5">{t("memberProfile")}</th>
                  <th className="px-8 py-5">{t("accessLevel")}</th>
                  <th className="px-8 py-5 text-right">{t("adminActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <tr key={u._id} className="group hover:bg-slate-50/80 dark:hover:bg-indigo-900/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                          {u.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-lg truncate">{u.fullname}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        u.role === 'restaurant_owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(u)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><FiEdit size={18} /></button>
                        <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : null}
              </tbody>
            </table>
          </div>
          {/* Mobile Card Layout - Hidden on Desktop */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
              <div key={u._id} className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
                    {u.fullname.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-base truncate">{u.fullname}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    u.role === 'restaurant_owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(u)} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-indigo-600 transition-all"><FiEdit size={16} /></button>
                    <button onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-red-500 transition-all"><FiTrash2 size={16} /></button>
                  </div>
                </div>
              </div>
            )) : null}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="px-8 py-20 text-center text-slate-400">
              <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">{t("noMembers")}</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALS - Responsive Backdrop and Size */}
      {(showAddModal || showEditModal || showDeleteModal) && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => { setShowAddModal(false); setShowEditModal(false); setShowDeleteModal(false); }}
          />

          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

            {/* ADD / EDIT FORM */}
            {(showAddModal || showEditModal) && (
              <>
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  {showAddModal ? t("inviteMember") : t("updateProfile")}
                </h2>
                <form onSubmit={showAddModal ? handleAddUser : handleUpdateUser} className="space-y-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">{t("fullName")}</label>
                    <input
                      type="text"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      value={showAddModal ? newUser.fullname : editUser.fullname}
                      onChange={(e) => showAddModal ? setNewUser({ ...newUser, fullname: e.target.value }) : setEditUser({ ...editUser, fullname: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">{t("emailAddress")}</label>
                    <input
                      type="email"
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                      value={showAddModal ? newUser.email : editUser.email}
                      onChange={(e) => showAddModal ? setNewUser({ ...newUser, email: e.target.value }) : setEditUser({ ...editUser, email: e.target.value })}
                      required
                    />
                  </div>
                  {showAddModal && (
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">{t("password")}</label>
                      <input
                        type="password"
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">{t("roleAssignment")}</label>
                    <select
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none transition-all"
                      value={showAddModal ? newUser.role : editUser.role}
                      onChange={(e) => showAddModal ? setNewUser({ ...newUser, role: e.target.value }) : setEditUser({ ...editUser, role: e.target.value })}
                      required
                    >
                      <option value="">Choose Role...</option>
                      <option value="customer">Customer</option>
                      <option value="restaurant_owner">Restaurant Owner</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-4">
                    <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="order-2 sm:order-1 flex-1 py-3 sm:py-4 font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase text-xs tracking-wider">{t("cancel")}</button>
                    <button type="submit" className="order-1 sm:order-2 flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all text-sm uppercase tracking-wider">
                      {showAddModal ? t("confirmAccess") : t("saveChanges")}
                    </button>
                  </div>
                </form>
              </>
            )}
            {/* DELETE CONFIRMATION */}
            {showDeleteModal && (
              <div className="text-center pt-2 pb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <FiTrash2 size={32} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t("revokeAccess")}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 px-2 text-sm sm:text-base">
                  {t("removeConfirm")} <span className="font-bold text-slate-900 dark:text-white">{selectedUser?.fullname}</span>? {t("cannotUndo")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="order-2 sm:order-1 flex-1 py-3 sm:py-4 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">{t("keepUser")}</button>
                  <button onClick={handleDeleteConfirm} className="order-1 sm:order-2 flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition-all text-sm uppercase tracking-wider">
                    {t("removeAccess")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}