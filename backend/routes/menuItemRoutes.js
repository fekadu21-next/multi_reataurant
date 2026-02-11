import express from "express";
import {
  createMenuItem,
  updateMenuItem,
  getMenuItems,
  getMenuItemsByRestaurant,
  getMenuItemsByRestaurantAndCategory,
  getMenuItemById,
  deleteMenuItem,
  upload,
} from "../controllers/menuItemController.js";

const router = express.Router();

// CRUD routes with image upload
router.post("/", upload.single("image"), createMenuItem);
router.put("/:id", upload.single("image"), updateMenuItem);
router.delete("/:id", deleteMenuItem);

// GET routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.get("/restaurant/:restaurantId", getMenuItemsByRestaurant);
router.get(
  "/restaurant/:restaurantId/category/:categoryId",
  getMenuItemsByRestaurantAndCategory,
);

export default router;
