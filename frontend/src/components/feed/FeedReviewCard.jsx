import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MapPin, Star, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useAuth } from '../../context/AuthContext';

const FeedReviewCard = ({ review, onClick, onReviewUpdate }) => {
  const { user } = useAuth();
  const isLikedInitially = user && review.likes?.some(id => id.toString() === user._id.toString());

  const [liked, setLiked] = useState(isLikedInitially); 
  const [likeCount, setLikeCount] = useState(review.likesCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
        alert("Vui lòng đăng nhập để thả tim!");
        return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
        const res = await fetch(`http://localhost:5000/api/reviews/${review._id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id })
        });
        const data = await res.json();
        
        if (data.success) {
            // Use authoritative response from backend
            setLiked(data.liked);
            setLikeCount(data.likesCount);
            // Notify parent to update list
            if (onReviewUpdate) {
                onReviewUpdate({ 
                    _id: review._id, 
                    likesCount: data.likesCount, 
                    likes: data.liked 
                        ? [...(review.likes || []), user._id] 
                        : (review.likes || []).filter(id => String(id) !== String(user._id))
                });
            }
        } else {
            setLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
        }
    } catch (err) {
        console.error("Like error:", err);
        setLiked(!newLiked);
        setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  let timeAgo = 'Vừa xong';
  try {
      if (review.createdAt) {
        timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi });
      }
  } catch (e) {
      console.error(e);
  }

  return (
    <div onClick={onClick} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow mb-6 cursor-pointer">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/user/${review.user?._id}`} className="flex-shrink-0">
            <img 
              src={review.user?.avatar || "https://placehold.co/100"} 
              alt={review.user?.name} 
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
                <Link to={`/user/${review.user?._id}`} className="font-bold text-gray-900 hover:underline">
                    {review.user?.name || "Người dùng ẩn danh"}
                </Link>
                {review.rating >= 4.5 && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                        Top Reviewer
                    </span>
                )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{timeAgo}</span>
                <span>•</span>
                <Link to={`/restaurant/${review.restaurant?._id}`} className="text-gray-600 font-medium hover:text-orange-600 truncate max-w-[150px] sm:max-w-xs flex items-center gap-1">
                    <MapPin size={12} />
                    {review.restaurant?.name || "Nhà hàng"}
                </Link>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-50 p-2 rounded-full">
            <MoreHorizontal size={20} />
        </button>
      </div>

      {/* RATING & TITLE */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
            <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-amber-500" : "text-gray-300"} />
                ))}
            </div>
            {review.title && <h3 className="font-bold text-gray-800 line-clamp-1">{review.title}</h3>}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {review.content}
        </p>
      </div>

      {/* IMAGES (GALLERY STYLE) */}
      {review.images && review.images.length > 0 && (
        <div className="mt-3 relative group cursor-pointer">
            {/* Simple Grid Logic: 1, 2, 3+ photos */}
            <div className={`grid ${review.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5 max-h-[400px] overflow-hidden`}>
                {review.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className={`relative pt-[70%] ${review.images.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                        <img 
                            src={img} 
                            alt={`Review ${idx}`} 
                            className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                         {/* More Overlay */}
                        {review.images.length > 4 && idx === 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                                +{review.images.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-2">
         <div className="flex items-center gap-6">
             <button 
                onClick={handleLike}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
             >
                 <Heart size={20} fill={liked ? "currentColor" : "none"} />
                 {likeCount > 0 && <span>{likeCount}</span>}
             </button>

             <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors">
                 <MessageCircle size={20} />
                 <span>{review.comments?.length > 0 ? `${review.comments.length} ` : ''}Bình luận</span>
             </button>
         </div>

         <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
             <Share2 size={20} />
         </button>
      </div>
    </div>
  );
};

export default FeedReviewCard;
