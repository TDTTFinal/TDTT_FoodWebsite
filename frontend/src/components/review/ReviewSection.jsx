import React, { useState, useEffect } from "react";
import { Star, MessageSquare, ChevronDown, Plus } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewModal from "./ReviewModal";
import api from "../../config/api";

const ReviewSection = ({ restaurantId, restaurantName }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = user?._id;

  // Fetch reviews
  const fetchReviews = async (pageNum = 1, sort = sortBy) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const response = await api.get(
        `/reviews/restaurant/${restaurantId}?page=${pageNum}&limit=5&sort=${sort}`
      );

      if (response.success) {
        if (pageNum === 1) {
          setReviews(response.data);
        } else {
          setReviews(prev => [...prev, ...response.data]);
        }
        setStats(response.stats);
        setHasMore(pageNum < response.pagination.totalPages);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchReviews(1, sortBy);
    }
  }, [restaurantId, sortBy]);

  // Handle new review success
  const handleReviewSuccess = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setStats(prev => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      avgRating: ((prev.avgRating * prev.totalReviews) + newReview.rating) / (prev.totalReviews + 1)
    }));
  };

  // Handle delete
  const handleDelete = async (reviewId) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      setStats(prev => ({
        ...prev,
        totalReviews: Math.max(0, prev.totalReviews - 1)
      }));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Không thể xóa đánh giá");
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, sortBy);
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={22} className="text-orange-500" />
            Đánh giá từ khách hàng
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <Plus size={18} />
            Viết đánh giá
          </button>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
          {/* Average Rating */}
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Star size={28} className="text-orange-500 fill-orange-500" />
              <span className="text-4xl font-black text-orange-600">
                {stats.avgRating?.toFixed(1) || "0.0"}
              </span>
            </div>
            <span className="text-sm text-gray-500">trên 10</span>
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-orange-200"></div>

          {/* Total & Distribution */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {stats.totalReviews || 0} đánh giá
            </div>
            {/* Rating bars */}
            <div className="space-y-1">
              {[
                { label: "9-10", count: stats.rating10 || 0, color: "bg-green-500" },
                { label: "7-8", count: stats.rating8 || 0, color: "bg-lime-500" },
                { label: "5-6", count: stats.rating6 || 0, color: "bg-yellow-500" },
                { label: "3-4", count: stats.rating4 || 0, color: "bg-orange-500" },
                { label: "1-2", count: stats.rating2 || 0, color: "bg-red-500" },
              ].map(bar => (
                <div key={bar.label} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-gray-500">{bar.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${bar.color}`}
                      style={{ 
                        width: stats.totalReviews > 0 
                          ? `${(bar.count / stats.totalReviews) * 100}%` 
                          : "0%" 
                      }}
                    ></div>
                  </div>
                  <span className="w-6 text-gray-400">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className="text-sm text-gray-500">Sắp xếp:</span>
        {[
          { id: "newest", label: "Mới nhất" },
          { id: "highest", label: "Điểm cao nhất" },
          { id: "helpful", label: "Hữu ích nhất" },
        ].map(option => (
          <button
            key={option.id}
            onClick={() => handleSortChange(option.id)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortBy === option.id
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="p-6 space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-gray-400 mb-4">
              Hãy là người đầu tiên đánh giá nhà hàng này!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Viết đánh giá
            </button>
          </div>
        ) : (
          <>
            {reviews.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={currentUserId}
                onDelete={handleDelete}
                onEdit={(r) => {
                  setEditingReview(r);
                  setShowModal(true);
                }}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="w-full py-3 text-orange-600 font-medium hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ChevronDown size={20} />
                Xem thêm đánh giá
              </button>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingReview(null); }}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onSuccess={handleReviewSuccess}
        editingReview={editingReview}
      />
    </div>
  );
};

export default ReviewSection;
