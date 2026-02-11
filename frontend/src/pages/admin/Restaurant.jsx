import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi";

const API_URL = "http://localhost:5000";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    ownerId: "",
    address: { street: "", city: "" },
    categories: "",
    deliveryFee: "",
    deliveryTime: "",
    description: "",
    image: null,
  });

  const [editRestaurant, setEditRestaurant] = useState({
    name: "",
    ownerId: "",
    address: { street: "", city: "" },
    categories: "",
    deliveryFee: "",
    deliveryTime: "",
    description: "",
    image: null,
  });

  const [message, setMessage] = useState("");
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  // FETCH restaurants
  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants`);
      const data = await res.json();
      console.log("the data is ", data);
      setRestaurants(data);
    } catch (err) {
      console.log(err);
    }
  };

  // FETCH owners
  const fetchOwners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users`);
      const data = await res.json();
      const filtered = data.filter((u) => u.role === "restaurant_owner");
      setOwners(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchOwners();
  }, []);

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ADD RESTAURANT
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newRestaurant.name);
      formData.append("ownerId", newRestaurant.ownerId);
      formData.append("street", newRestaurant.address.street);
      formData.append("city", newRestaurant.address.city);
      formData.append(
        "categories",
        JSON.stringify(
          newRestaurant.categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== ""),
        ),
      );
      formData.append("deliveryFee", newRestaurant.deliveryFee);
      formData.append("deliveryTime", newRestaurant.deliveryTime);
      formData.append("description", newRestaurant.description);
      if (newRestaurant.image) formData.append("image", newRestaurant.image);

      const res = await fetch(`${API_URL}/api/restaurants`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setRestaurants((prev) => [...prev, data.restaurant]);
        showMessage("Restaurant added successfully!");
        setShowAddModal(false);
        setNewRestaurant({
          name: "",
          ownerId: "",
          address: { street: "", city: "" },
          categories: "",
          deliveryFee: "",
          deliveryTime: "",
          description: "",
          image: null,
        });
      } else {
        showMessage(data.message || "Failed to add restaurant");
      }
    } catch (err) {
      console.log(err);
      showMessage("Server error");
    }
  };

  // OPEN EDIT MODAL
  const handleEditClick = (r) => {
    setSelectedRestaurant(r);
    setEditRestaurant({
      name: r.name,
      ownerId: r.ownerId,
      address: r.address,
      categories: r.categories.join(", "),
      deliveryFee: r.deliveryFee,
      deliveryTime: r.deliveryTime,
      description: r.description || "",
      image: null,
    });
    setShowEditModal(true);
  };

  // UPDATE RESTAURANT
  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editRestaurant.name);
      formData.append("ownerId", editRestaurant.ownerId);
      formData.append("street", editRestaurant.address.street);
      formData.append("city", editRestaurant.address.city);
      formData.append(
        "categories",
        JSON.stringify(
          editRestaurant.categories
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c !== ""),
        ),
      );
      formData.append("deliveryFee", editRestaurant.deliveryFee);
      formData.append("deliveryTime", editRestaurant.deliveryTime);
      formData.append("description", editRestaurant.description);
      if (editRestaurant.image) formData.append("image", editRestaurant.image);

      const res = await fetch(
        `${API_URL}/api/restaurants/${selectedRestaurant._id}`,
        { method: "PUT", body: formData },
      );

      const data = await res.json();
      if (!res.ok) return showMessage(data.message);

      setRestaurants((prev) =>
        prev.map((r) =>
          r._id === selectedRestaurant._id ? data.restaurant : r,
        ),
      );

      showMessage("Restaurant updated successfully!");
      setShowEditModal(false);
      setSelectedRestaurant(null);
    } catch (err) {
      console.log(err);
      showMessage("Update failed");
    }
  };

  // DELETE RESTAURANT
  const handleDeleteConfirm = async () => {
    try {
      await fetch(`${API_URL}/api/restaurants/${selectedRestaurant._id}`, {
        method: "DELETE",
      });

      setRestaurants((prev) =>
        prev.filter((r) => r._id !== selectedRestaurant._id),
      );
      showMessage("Restaurant deleted!");
      setShowDeleteModal(false);
    } catch (err) {
      console.log(err);
      showMessage("Delete failed");
    }
  };

  return (
    <div className="w-full px-6 py-6 mr-56">
      {message && (
        <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Restaurants</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gray-800 text-white flex items-center gap-2 px-4 py-2 rounded shadow hover:bg-gray-700"
        >
          <FiPlus /> Add Restaurant
        </button>
      </div>

      <input
        type="text"
        placeholder="Search restaurant..."
        className="border px-3 py-2 rounded w-full md:w-1/3 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-600">
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Categories</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Delivery Fee</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((r) => {
              const owner = owners.find((o) => o._id === r.ownerId);
              return (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-3">
                    {r.image ? (
                      <img
                        src={`${API_URL}${r.image}`} // ✅ Fixed path
                        alt={r.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{owner?.fullname || "Unknown"}</td>
                  <td className="px-4 py-3">
                    {r.address.street}, {r.address.city}
                  </td>
                  <td className="px-4 py-3">{r.categories.join(", ")}</td>
                  <td className="px-4 py-3">{r.description}</td>
                  <td className="px-4 py-3">{r.deliveryFee} birr</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(r)}
                      className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRestaurant(r);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <Modal>
          <AddEditForm
            type="add"
            restaurant={newRestaurant}
            setRestaurant={setNewRestaurant}
            handleSubmit={handleAddRestaurant}
            owners={owners}
            closeModal={() => setShowAddModal(false)}
          />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <Modal>
          <AddEditForm
            type="edit"
            restaurant={editRestaurant}
            setRestaurant={setEditRestaurant}
            handleSubmit={handleUpdateRestaurant}
            owners={owners}
            closeModal={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <Modal>
          <div className="bg-white p-6 rounded shadow w-96 text-center">
            <h2 className="text-lg font-semibold">Delete this restaurant?</h2>
            <p className="text-gray-600 mt-2">{selectedRestaurant?.name}</p>
            <div className="flex justify-center gap-4 mt-5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* MODAL WRAPPER */
function Modal({ children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      {children}
    </div>
  );
}

/* ADD / EDIT FORM COMPONENT */
function AddEditForm({
  type,
  restaurant,
  setRestaurant,
  handleSubmit,
  owners,
  closeModal,
}) {
  return (
    <div className="bg-white p-6 rounded shadow w-96">
      <h2 className="text-lg font-semibold mb-4">
        {type === "add" ? "Add" : "Edit"} Restaurant
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
        encType="multipart/form-data"
      >
        <input
          type="text"
          placeholder="Restaurant Name"
          className="border p-2 w-full rounded"
          value={restaurant.name}
          onChange={(e) =>
            setRestaurant({ ...restaurant, name: e.target.value })
          }
          required
        />
        <select
          className="border p-2 w-full rounded"
          value={restaurant.ownerId}
          onChange={(e) =>
            setRestaurant({ ...restaurant, ownerId: e.target.value })
          }
          required
        >
          <option value="">Select Owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullname}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Street"
          className="border p-2 w-full rounded"
          value={restaurant.address.street}
          onChange={(e) =>
            setRestaurant({
              ...restaurant,
              address: { ...restaurant.address, street: e.target.value },
            })
          }
          required
        />
        <input
          type="text"
          placeholder="City"
          className="border p-2 w-full rounded"
          value={restaurant.address.city}
          onChange={(e) =>
            setRestaurant({
              ...restaurant,
              address: { ...restaurant.address, city: e.target.value },
            })
          }
          required
        />
        <input
          type="text"
          placeholder="Categories (comma separated)"
          className="border p-2 w-full rounded"
          value={restaurant.categories}
          onChange={(e) =>
            setRestaurant({ ...restaurant, categories: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Description"
          className="border p-2 w-full rounded"
          value={restaurant.description}
          onChange={(e) =>
            setRestaurant({ ...restaurant, description: e.target.value })
          }
          required
        />
        <input
          type="number"
          placeholder="Delivery Fee (birr)"
          className="border p-2 w-full rounded"
          value={restaurant.deliveryFee}
          onChange={(e) =>
            setRestaurant({ ...restaurant, deliveryFee: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Delivery Time (e.g., 20-30 mins)"
          className="border p-2 w-full rounded"
          value={restaurant.deliveryTime}
          onChange={(e) =>
            setRestaurant({ ...restaurant, deliveryTime: e.target.value })
          }
          required
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setRestaurant({ ...restaurant, image: e.target.files[0] })
          }
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            {type === "add" ? "Add" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
