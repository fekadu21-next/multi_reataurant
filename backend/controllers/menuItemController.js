import MenuItem from "../models/MenuItem.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId, categoryId, name, description, price, isAvailable } =
      req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const menuItem = await MenuItem.create({
      restaurantId,
      categoryId,
      name,
      description,
      price,
      image,
      isAvailable,
    });

    res.status(201).json({ message: "Menu item created", menuItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL MENU ITEMS ----------------
export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate("categoryId", "name label")
      .populate("restaurantId", "name");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET MENU ITEMS BY RESTAURANT ----------------
export const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const items = await MenuItem.find({ restaurantId })
      .populate("categoryId", "name label")
      .populate("restaurantId", "name");

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET MENU ITEMS BY RESTAURANT AND CATEGORY ----------------
export const getMenuItemsByRestaurantAndCategory = async (req, res) => {
  try {
    const { restaurantId, categoryId } = req.params;

    const items = await MenuItem.find({ restaurantId, categoryId })
      .populate("categoryId", "name label")
      .populate("restaurantId", "name");

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET SINGLE ----------------
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate("categoryId", "name label")
      .populate("restaurantId", "name");

    if (!item) return res.status(404).json({ message: "Menu item not found" });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- UPDATE ----------------
export const updateMenuItem = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    if (!updated)
      return res.status(404).json({ message: "Menu item not found" });

    res.json({ message: "Menu item updated", menuItem: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- DELETE ----------------
export const deleteMenuItem = async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Menu item not found" });

    // delete image if exists
    if (deleted.image) {
      const filePath = deleted.image.replace("/uploads/", "uploads/");
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
