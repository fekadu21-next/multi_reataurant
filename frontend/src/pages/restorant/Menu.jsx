import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiGrid, FiList } from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Menu() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const rawRestaurantId = storedUser?.restaurant?.restaurantId;

  const restaurantId =
    rawRestaurantId && rawRestaurantId !== "null"
      ? typeof rawRestaurantId === "object"
        ? rawRestaurantId._id
        : rawRestaurantId
      : null;

  const [restaurant, setRestaurant] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    image: null,
    isAvailable: true,
  });

  /* ================= HELPERS ================= */
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  const getImageUrl = (path) =>
    path ? `${API_URL}${path.startsWith("/") ? "" : "/"}${path}` : null;

  /* ================= FETCH RESTAURANT ================= */
  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    const res = await fetch(`${API_URL}/api/restaurants/${restaurantId}`);
    const data = await res.json();
    setRestaurant(data);
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  /* ================= FETCH MENU ================= */
  const fetchMenu = async () => {
    if (!restaurantId) return;
    const res = await fetch(
      `${API_URL}/api/menu-items/restaurant/${restaurantId}`,
    );
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchMenu();
  }, [restaurantId]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingItem
      ? `${API_URL}/api/menu-items/${editingItem._id}`
      : `${API_URL}/api/menu-items`;

    const method = editingItem ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("restaurantId", restaurantId);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("categoryId", form.categoryId);
    formData.append("price", Number(form.price));
    formData.append("isAvailable", form.isAvailable);
    if (form.image instanceof File) formData.append("image", form.image);

    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed");
      return;
    }

    showMessage(editingItem ? "Menu updated!" : "Menu added!");
    setShowModal(false);
    setEditingItem(null);
    setForm({
      name: "",
      description: "",
      categoryId: "",
      price: "",
      image: null,
      isAvailable: true,
    });
    fetchMenu();
  };
  console.log("Stored user:", storedUser);
  console.log("Restaurant object:", storedUser?.restaurant);
  console.log("Restaurant ID extracted:", restaurantId);
  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    await fetch(`${API_URL}/api/menu-items/${id}`, { method: "DELETE" });
    showMessage("Menu deleted!");
    fetchMenu();
  };

  return (
    <div className="w-full px-6 py-6">
      {/* ================= RESTAURANT HEADER ================= */}
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow">
            {restaurant?.name || "Restaurant Menu"}
          </h1>
        </div>
      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow">
          {message}
        </div>
      )}

      {/* ================= HEADER CONTROLS ================= */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
          className="px-3 py-2 bg-gray-200 rounded flex items-center gap-1"
        >
          {viewMode === "grid" ? <FiList /> : <FiGrid />}
          {viewMode === "grid" ? "Table View" : "Grid View"}
        </button>

        <button
          onClick={() => {
            setEditingItem(null);
            setForm({
              name: "",
              description: "",
              categoryId: "",
              price: "",
              image: null,
              isAvailable: true,
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          <FiPlus /> Add Menu Item
        </button>
      </div>

      {/* ================= GRID VIEW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {item.categoryId?.name || "No category"}
            </p>
            <p className="font-bold text-blue-600 mt-1">{item.price} ETB</p>

            {item.image && (
              <img
                src={getImageUrl(item.image)}
                className="w-full h-32 object-cover rounded mt-2"
              />
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setForm({
                    name: item.name,
                    description: item.description || "",
                    categoryId: item.categoryId?._id || "",
                    price: item.price,
                    image: null,
                    isAvailable: item.isAvailable,
                  });
                  setShowModal(true);
                }}
                className="px-3 py-1 border rounded text-blue-600"
              >
                <FiEdit /> Edit
              </button>

              <button
                onClick={() => handleDelete(item._id)}
                className="px-3 py-1 border rounded text-red-600"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded w-full max-w-md"
          >
            <h2 className="font-semibold mb-3">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <select
              className="border p-2 w-full mb-2"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <textarea
              className="border p-2 w-full mb-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="number"
              className="border p-2 w-full mb-2"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              type="file"
              className="mb-2"
              onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            />

            <label className="flex gap-2 mb-3">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
              />
              Available
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-3 py-2 rounded"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-3 py-2 rounded">
                {editingItem ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
