import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { Quote, User } from "lucide-react";

const CommunityReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/restaurants/reviews/latest");
        if (res.success) {
          setReviews(res.data);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <section className="py-8 bg-orange-50/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-orange-500">💬</span> Cộng đồng đang bàn tán
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="min-w-[300px] w-[300px] bg-white p-5 rounded-xl shadow-sm border border-gray-100 snap-center flex flex-col"
            >
              {/* Header: User + Restaurant */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <User size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {review.user || "Người dùng ẩn danh"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    tại <span className="font-medium text-orange-600">{review.restaurant_name}</span>
                  </p>
                </div>
                <div className="bg-green-100 text-green-700 font-bold text-xs px-2 py-1 rounded-full">
                  {review.rating.toFixed(1)}
                </div>
              </div>

              {/* Comment with Quote icon */}
              <div className="relative bg-gray-50 p-3 rounded-lg flex-1">
                <Quote className="absolute top-2 left-2 text-gray-300 w-4 h-4" />
                <p className="text-gray-600 text-sm italic pl-4 line-clamp-3">
                  "{review.comment}"
                </p>
              </div>

              {/* Date */}
              <div className="mt-3 text-right text-xs text-gray-400">
                {new Date(review.date).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityReviews;
