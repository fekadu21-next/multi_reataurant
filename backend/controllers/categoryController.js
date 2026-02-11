import Category from "../models/Category.js";

// ---------------- CREATE CATEGORY (admin) ----------------
export const createCategory = async (req, res) => {
  try {
    const { key, name, label, icon, isActive, sortOrder } = req.body;

    const category = await Category.create({
      key: key?.toUpperCase(),
      name,
      label,
      icon,
      isActive,
      sortOrder,
    });

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL CATEGORIES ----------------
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }); // sort by sortOrder first, then name
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET SINGLE CATEGORY ----------------
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- UPDATE CATEGORY ----------------
export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.key) updateData.key = updateData.key.toUpperCase();

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    if (!updated)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", category: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- DELETE CATEGORY ----------------
export const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted", category: deleted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
