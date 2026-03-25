import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    const { rating, comment, images } = req.body;

    // 1️⃣ Check order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Check ownership
    if (order.customerId.toString() !== userId) {
      return res.status(403).json({ message: "You cannot review this order" });
    }

    // 3️⃣ Check delivery status
    if (order.orderStatus !== "DELIVERED") {
      return res
        .status(400)
        .json({ message: "You can review only delivered orders" });
    }

    // 4️⃣ Prevent duplicate review
    const existingReview = await Review.findOne({ orderId });

    if (existingReview) {
      return res.status(400).json({ message: "Order already reviewed" });
    }

    // 5️⃣ Create review
    const review = new Review({
      userId,
      orderId,
      restaurantId: order.restaurantId,
      rating,
      comment,
      images,
    });

    await review.save();

    // 6️⃣ Update restaurant rating
    const reviews = await Review.find({ restaurantId: order.restaurantId });

    const avgRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    await Restaurant.findByIdAndUpdate(order.restaurantId, {
      rating: avgRating,
      totalReviews: reviews.length,
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ restaurantId })
      .populate({
        path: "userId",
        select: "fullname profileImage", // fetch user name + profile image
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching restaurant reviews:", error);
    res.status(500).json({ message: error.message });
  }
};

export const checkReviewStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await Review.findOne({ orderId });

    if (review) {
      return res.json({
        reviewed: true,
      });
    }

    res.json({
      reviewed: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "userId",
        select: "fullname profileImage",
      })
      .populate({
        path: "restaurantId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: error.message });
  }
};
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate restaurant rating
    if (review.restaurantId) {
      const reviews = await Review.find({ restaurantId: review.restaurantId });
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
          : 0;

      await Restaurant.findByIdAndUpdate(review.restaurantId, {
        rating: avgRating,
        totalReviews: reviews.length,
      });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: error.message });
  }
};