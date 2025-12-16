import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const FeedReviewCard = ({ review, onClick, onReviewUpdate }) => {
  const { user } = useAuth();
  const isLikedInitially = user && review.likes?.some(id => id.toString() === user._id.toString());

  const [liked, setLiked] = useState(isLikedInitially);
  const [likeCount, setLikeCount] = useState(review.likesCount || 0);
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  
  const lastTapRef = useRef(0);
  const imageContainerRef = useRef(null);

  // Double tap to like
  const handleImageClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      e.stopPropagation();
      if (!liked) {
        handleLike(e);
      }
      // Show heart animation
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    } else {
      // Single tap - open modal after delay if no second tap
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY) {
          onClick?.();
        }
      }, DOUBLE_TAP_DELAY + 50);
    }
  };

  const handleLike = async (e) => {
    e?.stopPropagation();
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
        setLiked(data.liked);
        setLikeCount(data.likesCount);
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

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + review.images.length) % review.images.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % review.images.length);
  };

  let timeAgo = 'Vừa xong';
  try {
    if (review.createdAt) {
      timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: false, locale: vi });
    }
  } catch (e) {
    console.error(e);
  }

  const hasImages = review.images && review.images.length > 0;

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER - Compact IG Style */}
      <header className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <Link 
            to={`/user/${review.user?._id}`} 
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500">
              <img
                src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name || 'U'}&background=random`}
                alt={review.user?.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
          </Link>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Link 
                to={`/user/${review.user?._id}`} 
                className="font-semibold text-sm text-gray-900 hover:text-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {review.user?.name || "Người dùng"}
              </Link>
              {review.rating >= 8 && (
                <span className="text-blue-500">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </span>
              )}
            </div>
            <Link 
              to={`/restaurant/${review.restaurant?._id}`}
              className="text-xs text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={10} />
              <span className="truncate max-w-[180px]">{review.restaurant?.name || "Nhà hàng"}</span>
            </Link>
          </div>
        </div>

        <button 
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={20} className="text-gray-600" />
        </button>
      </header>

      {/* IMAGE CAROUSEL */}
      {hasImages ? (
        <div 
          ref={imageContainerRef}
          className="relative aspect-square bg-black cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Current Image */}
          <img
            src={review.images[currentImageIndex]}
            alt={`Review ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Heart Animation on Double Tap */}
          {showHeartAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart 
                size={100} 
                className="text-white fill-white animate-ping opacity-90"
                style={{ animationDuration: '0.8s' }}
              />
            </div>
          )}

          {/* Navigation Arrows */}
          {review.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all ${currentImageIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
              >
                <ChevronLeft size={18} className="text-gray-800" />
              </button>
              <button
                onClick={handleNextImage}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all ${currentImageIndex === review.images.length - 1 ? 'opacity-0' : 'opacity-100'}`}
              >
                <ChevronRight size={18} className="text-gray-800" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {review.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {currentImageIndex + 1}/{review.images.length}
            </div>
          )}

          {/* Dots Navigation */}
          {review.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {review.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? 'bg-blue-500 w-2.5' 
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // No image - show content preview
        <div 
          className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onClick}
        >
          <p className="text-gray-800 text-sm leading-relaxed">
            {review.content}
          </p>
        </div>
      )}

      {/* ACTIONS ROW */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="group p-1 -m-1"
          >
            <Heart
              size={24}
              className={`transition-all duration-200 group-hover:scale-110 ${
                liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-800 group-hover:text-gray-600'
              }`}
            />
          </button>

          {/* Comment Button */}
          <button 
            onClick={onClick}
            className="group p-1 -m-1"
          >
            <MessageCircle 
              size={24} 
              className="text-gray-800 group-hover:text-gray-600 group-hover:scale-110 transition-all duration-200" 
            />
          </button>

          {/* Share Button */}
          <button className="group p-1 -m-1">
            <Send 
              size={22} 
              className="text-gray-800 group-hover:text-gray-600 group-hover:scale-110 transition-all duration-200" 
            />
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
          className="group p-1 -m-1"
        >
          <Bookmark
            size={24}
            className={`transition-all duration-200 group-hover:scale-110 ${
              saved 
                ? 'fill-gray-800 text-gray-800' 
                : 'text-gray-800 group-hover:text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* LIKES COUNT */}
      {likeCount > 0 && (
        <div className="px-4 pb-1">
          <span className="text-sm font-semibold text-gray-900">
            {likeCount.toLocaleString()} lượt thích
          </span>
        </div>
      )}

      {/* CAPTION */}
      <div className="px-4 pb-2">
        <p className="text-sm">
          <Link 
            to={`/user/${review.user?._id}`}
            className="font-semibold text-gray-900 hover:text-gray-600 mr-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {review.user?.name || "Người dùng"}
          </Link>
          <span className="text-gray-800 line-clamp-2">
            {hasImages ? review.content : ''}
          </span>
        </p>
        
        {/* Rating Badge */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            review.rating >= 8 
              ? 'bg-green-100 text-green-700' 
              : review.rating >= 5 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-red-100 text-red-700'
          }`}>
            ⭐ {review.rating}/10
          </span>
          
          {/* Tags */}
          {review.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* VIEW COMMENTS */}
      {review.comments?.length > 0 && (
        <button 
          onClick={onClick}
          className="px-4 pb-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Xem tất cả {review.comments.length} bình luận
        </button>
      )}

      {/* TIMESTAMP */}
      <div className="px-4 pb-3">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
          {timeAgo}
        </span>
      </div>
    </article>
  );
};

export default FeedReviewCard;
