import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false); // ✅ toggle form

  const [newCategory, setNewCategory] = useState({
    key: "",
    name: "",
    label: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [editCategory, setEditCategory] = useState({});

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= ADD CATEGORY ================= */
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) throw new Error("Failed to add category");

      const data = await res.json();
      setCategories((prev) => [...prev, data.category]);

      setNewCategory({
        key: "",
        name: "",
        label: "",
        icon: "",
        sortOrder: 0,
        isActive: true,
      });

      setShowAddForm(false); // ✅ close form after add
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= EDIT CATEGORY ================= */
  const startEdit = (category) => {
    setEditingId(category._id);
    setEditCategory({ ...category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCategory({});
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCategory),
      });
      if (!res.ok) throw new Error("Failed to update category");

      const data = await res.json();
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? data.category : cat)),
      );

      cancelEdit();
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= DELETE CATEGORY ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");

      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading categories...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>

        {/* ✅ LEFT STYLE BUTTON */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition
            ${
              showAddForm
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }
            text-white`}
        >
          {showAddForm ? <X size={18} /> : <Plus size={18} />}
          {showAddForm ? "Close Form" : "Add Category"}
        </button>
      </div>

      {/* ================= ADD CATEGORY FORM ================= */}
      {showAddForm && (
        <form
          onSubmit={handleAddCategory}
          className="bg-white p-6 rounded-lg shadow mb-8 max-w-lg space-y-3 animate-fadeIn"
        >
          <h2 className="text-lg font-semibold mb-2">Add New Category</h2>

          <input
            type="text"
            placeholder="Key (DRINKS)"
            className="w-full p-2 border rounded"
            value={newCategory.key}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, key: e.target.value }))
            }
            required
          />

          <input
            type="text"
            placeholder="Name (Drinks)"
            className="w-full p-2 border rounded"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <input
            type="text"
            placeholder="Label (መጠጦች)"
            className="w-full p-2 border rounded"
            value={newCategory.label}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, label: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Icon (cup, flame, coffee)"
            className="w-full p-2 border rounded"
            value={newCategory.icon}
            onChange={(e) =>
              setNewCategory((prev) => ({ ...prev, icon: e.target.value }))
            }
          />

          <input
            type="number"
            placeholder="Sort Order"
            className="w-full p-2 border rounded"
            value={newCategory.sortOrder}
            onChange={(e) =>
              setNewCategory((prev) => ({
                ...prev,
                sortOrder: Number(e.target.value),
              }))
            }
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Save Category
          </button>
        </form>
      )}

      {/* ================= TABLE ================= */}
      <table className="min-w-full bg-white border rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Key</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Label</th>
            <th className="p-3 text-left">Icon</th>
            <th className="p-3 text-left">Order</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-t hover:bg-gray-50">
              {["key", "name", "label", "icon", "sortOrder"].map((field) => (
                <td key={field} className="p-2">
                  {editingId === cat._id ? (
                    <input
                      value={editCategory[field]}
                      onChange={(e) =>
                        setEditCategory((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    cat[field]
                  )}
                </td>
              ))}

              <td className="p-2 flex gap-2">
                {editingId === cat._id ? (
                  <>
                    <button
                      onClick={() => saveEdit(cat._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(cat)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
