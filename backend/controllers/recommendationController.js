import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID" });
    }

    const recommendationIds = new Set();

    /*
    ========================
    1️⃣ FAVORITE DISHES
    ========================
    */
    const user = await User.findById(userId)
      .populate("favorites.dishId")
      .lean();

    if (user?.favorites?.length) {
      user.favorites.forEach((fav) => {
        if (fav.dishId?._id) {
          recommendationIds.add(fav.dishId._id.toString());
        }
      });
    }

    /*
    ========================
    2️⃣ ORDER HISTORY
    ========================
    */
    const userOrders = await Order.find({ customerId: userId });

    const userMenuIds = [];

    userOrders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.menuItemId) {
          const id = item.menuItemId.toString();
          userMenuIds.push(id);
          recommendationIds.add(id);
        }
      });
    });

    /*
    ========================
    3️⃣ COLLABORATIVE FILTERING
    ========================
    */
    if (userMenuIds.length > 0) {
      const similarOrders = await Order.find({
        "items.menuItemId": { $in: userMenuIds },
      });

      similarOrders.forEach((order) => {
        order.items?.forEach((item) => {
          if (item.menuItemId) {
            const id = item.menuItemId.toString();

            if (!userMenuIds.includes(id)) {
              recommendationIds.add(id);
            }
          }
        });
      });
    }

    /*
    ========================
    4️⃣ POPULAR FOODS
    ========================
    */
    const popularItems = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItemId",
          totalOrders: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 20 },
    ]);

    popularItems.forEach((item) => {
      if (item._id) {
        recommendationIds.add(item._id.toString());
      }
    });

    /*
    ========================
    FINAL MENU QUERY
    ========================
    */
    const menus = await MenuItem.find({
      _id: { $in: Array.from(recommendationIds) },
    })
      .populate("restaurantId")
      .limit(12);

    res.status(200).json(menus);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};


/*
========================================
2️⃣ GUEST USER RECOMMENDATIONS
========================================
Return 8 most popular menu items
*/
export const getGuestRecommendations = async (req, res) => {
  try {

    const popularItems = await Order.aggregate([

      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.menuItemId",
          totalOrders: { $sum: "$items.quantity" }
        }
      },

      { $sort: { totalOrders: -1 } },

      { $limit: 8 },

      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menu"
        }
      },

      { $unwind: "$menu" },

      { $replaceRoot: { newRoot: "$menu" } }

    ]);

    res.status(200).json(popularItems);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch guest recommendations",
      error: error.message
    });

  }
};