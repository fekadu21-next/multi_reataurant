import React, { useState, useEffect } from "react";
import { FiTrash2, FiUserPlus, FiEdit } from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "",
  });

  const [editUser, setEditUser] = useState({
    fullname: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  // SUCCESS MESSAGE
  const [message, setMessage] = useState("");

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      const data = await res.json();
      console.log("user data", data);
      setUsers(data);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      !roleFilter || u.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // ➤ ADD USER
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
        showMessage("User added successfully!");
        setShowAddModal(false);

        setNewUser({
          fullname: "",
          email: "",
          password: "",
          role: "",
        });
      } else {
        showMessage(data.message || "Failed to add user");
      }
    } catch (err) {
      console.log(err);
      showMessage("Error adding user");
    }
  };

  // ➤ OPEN EDIT MODAL
  const handleEditClick = (u) => {
    setSelectedUser(u);
    setEditUser({
      fullname: u.fullname,
      email: u.email,
      role: u.role,
    });
    setShowEditModal(true);
  };

  // ➤ UPDATE USER
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editUser),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Update failed.");
        return;
      }

      // Update UI instantly
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === data.user._id ? data.user : u))
      );

      // SUCCESS MESSAGE (same as add/delete)
      showMessage("User updated successfully!");

      // Close modal
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      showMessage("Something went wrong while updating the user.");
    }
  };

  // ➤ DELETE USER
  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/auth/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));

      showMessage("User deleted successfully!");
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
      showMessage("Error deleting user");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading users...</p>
      </div>
    );

  return (
    <div className="w-full px-6 py-6 ">
      {/* SUCCESS MESSAGE POPUP */}
      {message && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Users</h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gray-800  text-white round flex items-center gap-2 px-4 py-2 rounded shadow hover:bg-gray-700"
        >
          <FiUserPlus /> Add User
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search fullname or email"
          className="border rounded px-3 py-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 w-full md:w-1/4"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="restaurant_owner">Restaurant Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-600">
              <th className="px-4 py-3 text-left">Full Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-3">{u.fullname}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>

                <td className="px-4 py-3 flex gap-2">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleEditClick(u)}
                    className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <FiEdit />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------------------- */}
      {/*           ADD USER MODAL          */}
      {/* --------------------------------- */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-semibold mb-4">Add User</h2>

            <form onSubmit={handleAddUser} className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                className="border p-2 w-full rounded"
                value={newUser.fullname}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullname: e.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full rounded"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="border p-2 w-full rounded"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />

              <select
                className="border p-2 w-full rounded"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                required
              >
                <option value="">Select Role</option>
                <option value="customer">Customer</option>
                <option value="restaurant_owner">Restaurant Owner</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-blue-600 rounded"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------- */}
      {/*          EDIT USER MODAL          */}
      {/* --------------------------------- */}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <input
                type="text"
                className="border p-2 w-full rounded"
                value={editUser.fullname}
                onChange={(e) =>
                  setEditUser({ ...editUser, fullname: e.target.value })
                }
                required
              />

              <input
                type="email"
                className="border p-2 w-full rounded"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                required
              />

              <select
                className="border p-2 w-full rounded"
                value={editUser.role}
                onChange={(e) =>
                  setEditUser({ ...editUser, role: e.target.value })
                }
                required
              >
                <option value="customer">Customer</option>
                <option value="restaurant_owner">Restaurant Owner</option>
                <option value="admin">Admin</option>
              </select>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-blue-600  rounded"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------- */}
      {/*        DELETE USER MODAL          */}
      {/* --------------------------------- */}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96 text-center">
            <h2 className="text-lg font-semibold">
              Are you sure you want to delete this user?
            </h2>

            <p className="text-gray-600 mt-2">{selectedUser?.email}</p>

            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-red-600 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
