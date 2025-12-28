import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, MessageCircle, Share2, Send, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ReviewDetailModal = ({ review: initialReview, onClose, currentUser, onReviewUpdate }) => {
  // Normalize: If input is a Post (has .review property), use that. Otherwise use input as Review.
  const realInitialReview = initialReview.review || initialReview;

  const [review, setReview] = useState(realInitialReview); // Local review state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(realInitialReview.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likesCount, setLikesCount] = useState(realInitialReview.likesCount || 0);
  
  // Initialize isLiked logic
  const [isLiked, setIsLiked] = useState(() => {
     if (!currentUser?._id || !realInitialReview.likes) return false;
     return realInitialReview.likes.some(id => id && String(id) === String(currentUser._id));
  });

  // Fetch fresh data on mount to ensure comments are up-to-date
  useEffect(() => {
    const fetchReviewDetail = async () => {
        try {
            // Use the correct ID (Review ID)
            const res = await fetch(`${API_BASE_URL}/reviews/${realInitialReview._id}`);
            const data = await res.json();
            if (data.success) {
                setReview(data.data);
                setComments(data.data.comments || []);
                setLikesCount(data.data.likesCount || 0);
                if (currentUser?._id && data.data.likes) {
                    setIsLiked(data.data.likes.some(id => id && String(id) === String(currentUser._id)));
                }
            }
        } catch (err) {
            console.error("Fetch review detail error:", err);
        }
    };
    fetchReviewDetail();
  }, [realInitialReview._id, currentUser]);

  // Handle body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % review.images.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + review.images.length) % review.images.length);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${review._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id, content: commentText })
      });
      const data = await res.json();
      if (data.success) {
        setComments([...comments, data.data]);
        setCommentText("");
        // Notify parent to update comment count if needed
        if (onReviewUpdate) {
          onReviewUpdate({ 
            _id: review._id, 
            comments: [...comments, data.data] 
          });
        }
      } else {
        alert("Không thể đăng bình luận: " + (data.error || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("Post comment error:", err);
      alert("Lỗi kết nối, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để thả tim!");
        return;
    }

    // Optimistic update
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
        const res = await fetch(`${API_BASE_URL}/reviews/${review._id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser._id })
        });
        const data = await res.json();
        if (data.success) {
            // Use authoritative response from backend
            setIsLiked(data.liked);
            setLikesCount(data.likesCount);
            // Notify parent to update list
            if (onReviewUpdate) {
                onReviewUpdate({ 
                    _id: review._id, 
                    likesCount: data.likesCount, 
                    likes: data.liked 
                        ? [...(review.likes || []), currentUser._id] 
                        : (review.likes || []).filter(id => String(id) !== String(currentUser._id))
                });
            }
        } else {
            // Revert on error
            setIsLiked(!newLiked);
            setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
        }
    } catch (err) {
        console.error("Like error:", err);
        setIsLiked(!newLiked);
        setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const timeAgo = (date) => {
     try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
     } catch (e) {
        return "Vừa xong";
     }
  };

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Close Button Mobile */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 lg:hidden p-2 bg-black/50 rounded-full">
        <X size={24} />
      </button>

      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        
        {/* LEFT: IMAGE GALLERY (60-70%) */}
        <div className="w-full lg:w-[65%] bg-black relative flex items-center justify-center h-[40vh] lg:h-[90vh]">
             {review.images && review.images.length > 0 ? (
                 <>
                    <img 
                      src={review.images[currentImageIndex]} 
                      alt="Review" 
                      className="max-h-full max-w-full object-contain"
                    />
                    
                    {/* Navigation Buttons */}
                    {review.images.length > 1 && (
                        <>
                            <button onClick={handlePrevImage} className="absolute left-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <button onClick={handleNextImage} className="absolute right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
                                <ChevronRight size={24} />
                            </button>
                            
                            {/* Dots */}
                            <div className="absolute bottom-4 flex gap-2">
                                {review.images.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-white scale-125" : "bg-white/50"}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                 </>
             ) : (
                 <div className="text-gray-500 text-center p-10">Bài viết không có ảnh</div>
             )}
        </div>

        {/* RIGHT: CONTENT (30-35%) */}
        <div className="w-full lg:w-[35%] flex flex-col h-[50vh] lg:h-[90vh] bg-white border-l border-gray-100">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                    <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name}`} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    <div>
                        <h4 className="font-bold text-sm text-gray-900">{review.user?.name || "Người dùng ẩn danh"}</h4>
                        <p className="text-xs text-gray-500">{review.restaurant?.name}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20}/></button>
                <button onClick={onClose} className="hidden lg:block ml-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                
                {/* Review Body */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                         <div className="flex text-yellow-500 text-sm">
                            {"★".repeat(Math.round(review.rating))}
                            <span className="text-gray-300">{"★".repeat(10 - Math.round(review.rating))}</span>
                         </div>
                         <span className="font-bold text-sm">{review.rating}/10</span>
                         <span className="text-xs text-gray-400">• {timeAgo(review.createdAt)}</span>
                    </div>
                    {review.title && <h3 className="font-bold text-gray-800 mb-2">{review.title}</h3>}
                    <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">{review.content}</p>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-50 pt-4">
                    <h5 className="font-bold text-sm text-gray-800 mb-4">Bình luận ({comments.length})</h5>
                    
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        ) : (
                            comments.map((comment, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                     <img src={comment.user?.avatar || `https://ui-avatars.com/api/?name=User`} className="w-8 h-8 rounded-full object-cover mt-1" />
                                     <div className="flex-1">
                                         <div className="bg-gray-50 px-3 py-2 rounded-2xl rounded-tl-none inline-block">
                                             <span className="font-bold text-xs block mr-2">{comment.user?.name || "Người dùng"}</span>
                                             <span className="text-sm text-gray-700">{comment.content}</span>
                                         </div>
                                         <div className="flex gap-4 mt-1 ml-1 text-[10px] text-gray-400 font-medium">
                                             <span>{timeAgo(comment.createdAt)}</span>
                                             <button className="hover:text-gray-600">Thích</button>
                                             <button className="hover:text-gray-600">Trả lời</button>
                                         </div>
                                     </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
                <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-6">
<button onClick={handleLike} className="group flex items-center gap-2">
                             <Heart size={24} className={`group-hover:scale-110 transition-transform ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                        </button>
                        <button onClick={() => document.getElementById("commentInput")?.focus()} className="group">
                             <MessageCircle size={24} className="text-gray-600 group-hover:scale-110 group-hover:text-blue-500 transition-transform" />
                        </button>
                        <button className="group">
                             <Share2 size={24} className="text-gray-600 group-hover:scale-110 group-hover:text-green-500 transition-transform" />
                        </button>
                     </div>
                     <span className="font-bold text-sm text-gray-800">{likesCount} lượt thích</span>
                </div>

                {/* Comment Input */}
                {/* Comment Input */}
                {!currentUser ? (
                     <div className="w-full bg-gray-50 border border-gray-100 rounded-full p-2 flex items-center justify-between px-4">
                        <span className="text-sm text-gray-400">Đăng nhập để bình luận</span>
                        <Link to="/login" className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors">
                            Đăng nhập
                        </Link>
                     </div>
                ) : (
                    <form onSubmit={handlePostComment} className="flex items-center gap-2 relative">
                        <input 
                            id="commentInput"
                            type="text" 
                            placeholder="Thêm bình luận..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-4 pr-10 text-sm focus:ring-1 focus:ring-gray-200 transition-all font-medium"
                        />
                        {commentText.trim() && (
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="absolute right-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors font-bold text-xs"
                            >
                                {isSubmitting ? "..." : "Đăng"}
                            </button>
                        )}
                    </form>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;
