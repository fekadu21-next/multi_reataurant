import Review from "../models/Review.js";

// CREATE a new review
export const createReview = async (req, res) => {
  try {
    const { userId, restaurantId, rating, comment, images } = req.body;

    // Optional: Check if user already reviewed this restaurant
    const exists = await Review.findOne({ userId, restaurantId });
    if (exists)
      return res
        .status(400)
        .json({ message: "You already reviewed this restaurant" });

    const review = await Review.create({
      userId,
      restaurantId,
      rating,
      comment,
      images,
    });

    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "fullname profileImage")
      .populate("restaurantId", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET reviews by restaurant
export const getReviewsByRestaurant = async (req, res) => {
  try {
    const reviews = await Review.find({
      restaurantId: req.params.restaurantId,
    }).populate("userId", "fullname profileImage");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE a review
export const updateReview = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review updated", review: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE a review
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
