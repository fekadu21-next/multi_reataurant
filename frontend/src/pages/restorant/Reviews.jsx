import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiStar, FiMessageSquare, FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
const API_URL = "http://localhost:5000";

export default function Reviews() {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantId = storedUser?.restaurant?.restaurantId;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/reviews/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReviews(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  /* -------- CALCULATE AVERAGE RATING (Logic Preserved) -------- */
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 bg-transparent text-gray-900 dark:text-gray-100">

      {/* HEADER & SUMMARY CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{t("reviewss.title")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">{t("reviewss.subtitle")}</p>
        </div>

        <div className="flex items-center gap-6 bg-gray-50 dark:bg-slate-800/50 px-6 py-4 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
              {avgRating} <FiStar className="text-yellow-400 fill-yellow-400 w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{t("reviewss.avgRating")}</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-slate-700"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{reviews.length}</div>
            <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{t("reviewss.totalReviews")}</p>
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">{t("reviewss.loading")}...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 transition-colors">
            <FiMessageSquare className="mx-auto w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-300">{t("reviewss.noReviews")}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-slate-800 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                  {/* USER INFO SECTION */}
                  <div className="flex items-start gap-4">
                    {review.userId?.profileImage ? (
                      <img
                        src={`${API_URL}${review.userId.profileImage}`}
                        alt={review.userId?.fullname}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-50 dark:ring-slate-800 shadow-sm"
                        onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + review.userId?.fullname }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-200 dark:border-blue-800">
                        {review.userId?.fullname?.charAt(0) || "C"}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {review.userId?.fullname || t("reviewss.anonymous")}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200 dark:text-slate-700"
                              }`}
                          />
                        ))}
                        <span className="text-xs text-gray-400 dark:text-slate-500 ml-3 flex items-center gap-1 font-medium">
                          <FiCalendar className="inline" /> {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* REVIEW CONTENT */}
                {review.comment && (
                  <div className="mt-4 text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-50 dark:border-slate-800 italic transition-colors">
                    "{review.comment}"
                  </div>
                )}

                {/* ATTACHED REVIEW IMAGES */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 flex-wrap mt-5">
                    {review.images.map((img, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg border border-gray-100 dark:border-slate-800">
                        <img
                          src={`${API_URL}${img}`}
                          alt={t("reviewss.attachment")}
                          className="w-14 h-14 object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}