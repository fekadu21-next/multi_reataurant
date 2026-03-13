import { useState } from "react";
import axios from "axios";
import { Star, X, Loader2 } from "lucide-react";

const ReviewModal = ({ orderId, restaurantName, onClose, onSuccess }) => {

  const token = localStorage.getItem("token");

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `http://localhost:5000/api/reviews/create/${orderId}`,
        {
          rating,
          comment,
          images: []
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
      onClose();

    } catch (err) {
      console.log(err);
      alert("Failed to submit review");

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">

      {/* Modal */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-[fadeIn_.25s_ease]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="mb-5">

          <h2 className="text-2xl font-bold text-slate-800">
            Review {restaurantName}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Tell others about your experience
          </p>

        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center gap-2 mb-6">

          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={34}
              className={`cursor-pointer transition-transform duration-200
                ${(hover || rating) >= star
                  ? "fill-yellow-400 text-yellow-400 scale-110"
                  : "text-gray-300"}
              `}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setRating(star)}
            />
          ))}

        </div>

        {/* Rating Text */}
        <p className="text-center text-sm text-gray-500 mb-4">

          {rating === 0 && "Select your rating"}

          {rating === 1 && "Poor"}
          {rating === 2 && "Fair"}
          {rating === 3 && "Good"}
          {rating === 4 && "Very Good"}
          {rating === 5 && "Excellent"}

        </p>

        {/* Comment Box */}
        <textarea
          placeholder="Write your review..."
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
        />

        {/* Submit Button */}
        <button
          onClick={submitReview}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition active:scale-[.98] disabled:opacity-60"
        >

          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}

        </button>

      </div>

    </div>
  );
};

export default ReviewModal;