import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";
export const getRestaurantCustomers = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const customers = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
        },
      },

      {
        $group: {
          _id: "$customerId",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
          lastOrder: { $max: "$createdAt" },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "customer",
        },
      },

      { $unwind: "$customer" },

      {
        $project: {
          fullname: "$customer.fullname",
          email: "$customer.email",
          profileImage: "$customer.profileImage",
          totalOrders: 1,
          totalSpent: 1,
          lastOrder: 1,
        },
      },
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};