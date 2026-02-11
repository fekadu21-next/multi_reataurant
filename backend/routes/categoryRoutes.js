import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// CRUD routes
router.post("/", createCategory); // create category (admin)
router.put("/:id", updateCategory); // update category
router.delete("/:id", deleteCategory); // delete category

// GET routes
router.get("/", getCategories); // get all categories
router.get("/:id", getCategoryById); // get single category

export default router;
