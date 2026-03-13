import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

// 1️⃣ Fetch notifications for logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("orderId", "orderStatus")
      .populate("userId", "fullname email");

    res.json({ notifications });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Create notification after order delivered
export const createReviewNotification = async (orderId) => {
  try {

    const order = await Order.findById(orderId);
    if (!order) return;

    if (order.orderStatus !== "DELIVERED") return;

    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant) return;

    // ✅ Get menu item names from order
    const menuNames = order.items
      .map(item => item.name || item.menuItemId?.name)
      .join(", ");

    await Notification.create({
      userId: order.customerId,
      orderId: order._id,
      message: `Your order from ${restaurant.name} (${menuNames}) has been delivered. Please write a review.`,
    });

    console.log("Review notification created for order:", order._id);

  } catch (error) {
    console.error("Error creating review notification:", error.message);
  }
};

// 3️⃣ Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndUpdate(notificationId, {
      isRead: true
    });

    res.json({ message: "Notification marked as read" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};