import User from "../models/User.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
// ========================
// Multer setup for profile images
// ========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads/profile";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + "-" + Date.now() + ext);
  },
});

export const upload = multer({
  storage,

  // 🔹 Increase size if needed (optional)
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max

  fileFilter: function (req, file, cb) {
    // ✅ Accept ANY image type
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    // ❌ Reject non-image files
    cb(new Error("Only image files are allowed"));
  },
});

// ========================
// PUT: Update Profile Image
// ========================
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profileImagePath = `/uploads/profile/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImagePath },
      { new: true }
    );

    res.status(200).json({ message: "Profile image updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile image", error: err.message });
  }
};
// ========================
// GET: My Orders
// ========================
export const getOrders = async (req, res) => {
  try {
    console.log("===== GET /myorders HIT =====");

    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user?._id);
    console.log("req.user._id type:", typeof req.user?._id);

    const orders = await Order.find({
      customerId: req.user._id,
    })
      .populate("items.menuItemId", "name price")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
};

// ========================
// POST: Reorder (one-click reorder)
// ========================
export const reorder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Create new order copying ALL required fields
    const newOrder = new Order({
      customerId: userId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      restaurantId: order.restaurantId,
      items: order.items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      commissionPercent: order.commissionPercent,
      adminCommission: order.adminCommission,
      restaurantAmount: order.restaurantAmount,
      deliveryAddress: order.deliveryAddress,
      instructions: order.instructions
    });

    await newOrder.save();

    res.status(200).json({
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to reorder",
      error: err.message
    });
  }
};

// ========================
// GET: Favorites
// ========================
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: "favorites.restaurantId",
        select: "name image" // ✅ fixed
      })
      .populate({
        path: "favorites.dishId",
        select: "name price categoryId image",
        populate: {
          path: "categoryId",
          select: "name"
        }
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const API_URL = process.env.API_URL || "http://localhost:5000";

    const favorites = user.favorites.map((fav) => {

      const restaurant = fav.restaurantId
        ? {
          _id: fav.restaurantId._id,
          name: fav.restaurantId.name,
          image: fav.restaurantId.image
            ? `${API_URL}/uploads/${fav.restaurantId.image}` // ✅ fixed
            : null
        }
        : null;

      const dish = fav.dishId
        ? {
          _id: fav.dishId._id,
          name: fav.dishId.name,
          price: fav.dishId.price,
          image: fav.dishId.image
            ? `${API_URL}${fav.dishId.image}`
            : null,
          category: fav.dishId.categoryId
            ? fav.dishId.categoryId.name
            : null
        }
        : null;

      return {
        _id: fav._id,
        type: fav.type,
        restaurant,
        dish
      };
    });

    res.status(200).json({ favorites });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch favorites",
      error: err.message
    });
  }
};
// ========================
// POST: Add Favorite
// ========================
export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, restaurantId, dishId } = req.body;

    // Validate request
    if (!type || !restaurantId || (type === "dish" && !dishId)) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if already exists
    const exists = user.favorites.some((f) => {
      return (
        f.type === type &&
        f.restaurantId?.toString() === restaurantId &&
        (type === "dish" ? f.dishId?.toString() === dishId : true)
      );
    });

    // Add if not exists
    if (!exists) {
      user.favorites.push({
        type,
        restaurantId,
        dishId: type === "dish" ? dishId : null,
      });

      await user.save();
    }

    // Get populated favorites
    const populatedUser = await User.findById(userId)
      .populate({
        path: "favorites.restaurantId",
        select: "name profileImage",
      })
      .populate({
        path: "favorites.dishId",
        model: "MenuItem", // ✅ important fix
        select: "name price categoryId image",
      })
      .lean();

    return res.status(200).json({
      message: "Added to favorites",
      favorites: populatedUser.favorites,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to add favorite",
      error: err.message,
    });
  }
};

// ========================
// DELETE: Remove Favorite
// ========================
export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, restaurantId, dishId } = req.body;

    // Validate request
    if (!type || !restaurantId || (type === "dish" && !dishId)) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove matching favorite
    user.favorites = user.favorites.filter((f) => {
      if (f.type !== type) return true;
      if (f.restaurantId?.toString() !== restaurantId) return true;
      if (type === "dish" && f.dishId?.toString() !== dishId) return true;
      return false; // remove match
    });

    await user.save();

    // Populate updated favorites
    const populatedUser = await User.findById(userId)
      .populate({
        path: "favorites.restaurantId",
        select: "name profileImage",
      })
      .populate({
        path: "favorites.dishId",
        model: "MenuItem", // ✅ correct model
        select: "name price categoryId image",
      })
      .lean();

    return res.status(200).json({
      message: "Removed from favorites",
      favorites: populatedUser.favorites,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to remove favorite",
      error: err.message,
    });
  }
};
// ========================
// GET: Account Info
// ========================
export const getAccountInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password -otp")
      .lean();

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch account info", error: err.message });
  }
};

// ========================
// PUT: Update Account Info (Profile + Address)
// ========================
export const updateAccountInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullname, email, address } = req.body;

    // Update simple fields
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;

    // SAFE nested update (DO NOT overwrite whole object)
    if (address) {
      if (address.phone !== undefined)
        user.address.phone = address.phone;

      if (address.street !== undefined)
        user.address.street = address.street;

      if (address.city !== undefined)
        user.address.city = address.city;

      // ⚠️ DO NOT TOUCH coordinates
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update account",
      error: error.message,
    });
  }
};

// ========================
// PUT: Change Password
// ========================
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};