import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import multer from "multer";
import fs from "fs";
import path from "path";

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// ---------------- CREATE ----------------
export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      ownerId,
      address,
      categories,
      deliveryFee,
      deliveryTime,
      description,
    } = req.body;

    // Ensure categories is stored as an array
    let categoriesArray = categories;
    if (typeof categories === "string") {
      try {
        categoriesArray = JSON.parse(categories);
        if (!Array.isArray(categoriesArray))
          categoriesArray = [categoriesArray];
      } catch {
        categoriesArray = categories.split(",").map((c) => c.trim());
      }
    }

    const image = req.file ? req.file.filename : ""; // store only filename

    const restaurant = await Restaurant.create({
      name,
      ownerId,
      address,
      categories: categoriesArray,
      deliveryFee,
      deliveryTime,
      description,
      image,
    });

    // Update owner document
    if (ownerId) {
      await User.findByIdAndUpdate(ownerId, {
        restaurant: {
          restaurantId: restaurant._id,
          name: restaurant.name,
        },
      });
    }

    // Send back full image path
    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: {
        ...restaurant._doc,
        image: restaurant.image ? `/uploads/${restaurant.image}` : "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL ----------------
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();

    const formatted = restaurants.map((r) => ({
      ...r._doc,
      image: r.image ? `/uploads/${r.image}` : "",
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET SINGLE ----------------
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant)
      return res.status(404).json({ message: "Restaurant not found" });
    res.json({
      ...restaurant._doc,
      image: restaurant.image ? `/uploads/${restaurant.image}` : "",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- UPDATE ----------------
export const updateRestaurant = async (req, res) => {
  try {
    const { ownerId, categories } = req.body;
    let updateData = { ...req.body };

    // Ensure categories is array
    if (categories) {
      let categoriesArray = categories;
      if (typeof categories === "string") {
        try {
          categoriesArray = JSON.parse(categories);
          if (!Array.isArray(categoriesArray))
            categoriesArray = [categoriesArray];
        } catch {
          categoriesArray = categories.split(",").map((c) => c.trim());
        }
      }
      updateData.categories = categoriesArray;
    }

    if (req.file) updateData.image = req.file.filename;

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updated)
      return res.status(404).json({ message: "Restaurant not found" });

    // Update owner info
    if (ownerId) {
      const prevOwner = await User.findOne({
        "restaurant.restaurantId": updated._id,
      });
      if (prevOwner && prevOwner._id.toString() !== ownerId) {
        await User.findByIdAndUpdate(prevOwner._id, { restaurant: null });
      }
      await User.findByIdAndUpdate(ownerId, {
        restaurant: { restaurantId: updated._id, name: updated.name },
      });
    }

    res.json({
      message: "Restaurant updated successfully",
      restaurant: {
        ...updated._doc,
        image: updated.image ? `/uploads/${updated.image}` : "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- DELETE ----------------
export const deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Restaurant not found" });

    // Remove restaurant reference from owner
    if (deleted.ownerId) {
      await User.findByIdAndUpdate(deleted.ownerId, { restaurant: null });
    }

    // Remove image from uploads folder
    if (deleted.image) {
      const filePath = path.join("uploads", deleted.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
