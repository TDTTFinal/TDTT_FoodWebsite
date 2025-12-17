import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { Quote, User, Star, MapPin, MessageSquare, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch from new community endpoint
        const res = await api.get("/reviews/community");
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

  if (loading) {
    return (
      <section className="py-8 bg-orange-50/50">
        <div className="container mx-auto px-4">
           <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
           </div>
           <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="min-w-[320px] h-[200px] bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
           </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
       {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 mb-2">
              <span className="text-4xl">💬</span> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">
                Cộng đồng bàn tán
              </span>
            </h2>
            <p className="text-gray-500 font-medium">Xem mọi người đang review gì hôm nay!</p>
          </div>
          <Link to="/history" className="hidden md:flex items-center gap-1 text-orange-600 font-bold hover:gap-2 transition-all">
            Xem lịch sử <Quote size={18} />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x px-2">
          {reviews.map((review, idx) => (
            <Link 
              to={`/restaurant/${review.restaurant}`}
              key={review._id}
              className="group min-w-[320px] w-[320px] bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 snap-center flex flex-col overflow-hidden"
            >
              {/* Image Preview Area */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {review.images && review.images.length > 0 ? (
                  <img 
                    src={review.images[0]} 
                    alt="Review visual" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-200">
                    <MessageSquare size={64} />
                  </div>
                )}
                
                {/* Overlay with Rating */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold text-sm shadow-sm flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" fill="currentColor" />
                  {review.rating.toFixed(1)}
                </div>

                {/* Multi-image indicator */}
                {review.images && review.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <ImageIcon size={12} /> +{review.images.length - 1}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-5 flex flex-col flex-1">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={review.userAvatar || "https://placehold.co/100x100"} 
                    alt={review.user}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    onError={(e) => { e.target.src = "https://placehold.co/100x100/e2e8f0/64748b?text=User" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">
                      {review.user}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Restaurant Name */}
                <h3 className="font-bold text-gray-800 mb-2 truncate group-hover:text-orange-600 transition-colors">
                  {review.restaurant_name}
                </h3>

                {/* Comment */}
                <div className="relative pl-3 border-l-2 border-orange-200 flex-1">
                  <p className="text-gray-600 text-sm italic line-clamp-3">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityReviews;
