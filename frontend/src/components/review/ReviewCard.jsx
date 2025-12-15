import React, { useState } from "react";
import { ThumbsUp, MoreVertical, Star, Calendar, Flag, Pencil, Trash2 } from "lucide-react";
import api from "../../config/api";

const ReviewCard = ({ review, currentUserId, onLike, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [isLiked, setIsLiked] = useState(
    review.likes?.includes(currentUserId)
  );
  const [likesCount, setLikesCount] = useState(review.likesCount || 0);

  // Get user display info
  const userName = review.isAnonymous 
    ? "Ẩn danh" 
    : review.user?.name || "Người dùng";
  
  const avatarUrl = review.isAnonymous 
    ? null 
    : review.user?.avatar_url;

  const avatarInitial = userName.charAt(0).toUpperCase();

  // Handle like
  const handleLike = async () => {
    if (!currentUserId) {
      alert("Vui lòng đăng nhập để thích đánh giá");
      return;
    }

    try {
      const response = await api.post(`/reviews/${review._id}/like`, { userId: currentUserId });
      if (response.success) {
        setIsLiked(response.liked);
        setLikesCount(response.likesCount);
        onLike?.(review._id, response.liked);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // Handle report
  const handleReport = async (reason) => {
    try {
      setReporting(true);
      await api.post(`/reviews/${review._id}/report`, { 
        userId: currentUserId,
        reason 
      });
      setShowReportModal(false);
      alert("Đã gửi báo cáo. Cảm ơn bạn!");
    } catch (error) {
      console.error("Report error:", error);
      alert("Không thể gửi báo cáo");
    } finally {
      setReporting(false);
    }
  };

  const isOwner = currentUserId && review.user?._id === currentUserId;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
              {avatarInitial}
            </div>
          )}
          
          {/* Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{userName}</span>
              {review.isEdited && (
                <span className="text-xs text-gray-400 italic">(đã chỉnh sửa)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{review.timeAgo || "Vừa xong"}</span>
              {review.visitDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Đi ăn: {new Date(review.visitDate).toLocaleDateString("vi-VN")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
          <Star size={14} className="text-orange-500 fill-orange-500" />
          <span className="font-bold text-orange-600">{review.rating}/10</span>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-gray-600 leading-relaxed mb-3">{review.content}</p>

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((img, idx) => (
            <img 
              key={idx}
              src={img}
              alt={`Review image ${idx + 1}`}
              className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(img, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isLiked 
              ? "bg-blue-50 text-blue-600" 
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <ThumbsUp size={16} className={isLiked ? "fill-blue-600" : ""} />
          Hữu ích {likesCount > 0 && `(${likesCount})`}
        </button>

        {/* Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              {isOwner ? (
                <>
                  <button 
                    onClick={() => { onEdit?.(review); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil size={14} />
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => { onDelete?.(review._id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Flag size={14} />
                  Báo cáo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Báo cáo đánh giá</h3>
            <div className="space-y-2">
              {["Nội dung không phù hợp", "Spam", "Thông tin sai lệch", "Khác"].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  disabled={reporting}
                  className="w-full py-2.5 text-left px-4 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowReportModal(false)}
              className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
