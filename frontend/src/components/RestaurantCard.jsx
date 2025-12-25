import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, DollarSign, Heart } from "lucide-react";
import { getOpenStatus, getStatusBadgeClasses } from "../utils/openingHoursUtils";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { useState, useEffect } from "react";

const RestaurantCard = ({ restaurant, action }) => {
  const {
    _id,
    name,
    address,
    opening_hours,
    price_range,
    avatar_url,
    avg_rating,
    category,
    scores,
    menu,
    distance, // Add distance here
  } = restaurant;

  const { user, updateUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Check if restaurant is in user favorites
  useEffect(() => {
    if (user && user.favorites) {
      // Check if favorites is array of strings or objects
      const favIds = user.favorites.map(f => typeof f === 'object' ? f._id : f);
      setIsFavorite(favIds.includes(_id));
    }
  }, [user, _id]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      alert("Vui lòng đăng nhập để lưu quán yêu thích!");
      return;
    }

    setLoadingFav(true);
    try {
      if (isFavorite) {
        // Remove
        const res = await api.delete(`/users/favorites/${_id}`);
        if (res.success) {
            setIsFavorite(false);
            // Optional: Update global context if needed
             // Refetch user profile to sync favorites locally
             const userRes = await api.get('/users/profile');
             if(userRes.success) updateUser(userRes.user);
        }
      } else {
        // Add
        const res = await api.post(`/users/favorites/${_id}`);
        if (res.success) {
            setIsFavorite(true);
            const userRes = await api.get('/users/profile');
            if(userRes.success) updateUser(userRes.user);
        }
      }
    } catch (err) {
      console.error("Lỗi toggle favorite:", err);
    } finally {
      setLoadingFav(false);
    }
  };

  // Get open status
  const openStatus = getOpenStatus(opening_hours);

  // Format rating
  const formatRating = (rating) =>
    typeof rating === "number" ? rating.toFixed(1) : "N/A";

  // Get rating color class
  const getRatingColorClass = (rating) => {
    if (!rating) return "bg-gray-400";
    if (rating >= 8.0) return "bg-green-500"; // Scale 10
    if (rating >= 6.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get district
  const getDistrict = (addr) => {
    if (!addr) return "";
    const match = addr.match(/Quận\s+\d+|Q\.\s*\d+|Quận\s+\w+/i);
    return match ? match[0] : "";
  };

  return (
    <Link to={`/restaurant/${_id}`} className="block h-full">
      <div className="group h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* Image Container */}
        <div className="relative pt-[66.67%] overflow-hidden bg-gray-100">
          <img
            src={avatar_url || "https://placehold.co/400x300/E0E0E0/999?text=No+Image"}
            alt={name}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://placehold.co/400x300/E0E0E0/999?text=No+Image";
            }}
          />

          {/* Favorite Button (Heart) */}
          <button
            onClick={handleToggleFavorite}
            disabled={loadingFav}
            className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hover:scale-110 active:scale-95"
          >
            <Heart 
                size={18} 
                className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`} 
            />
          </button>

          {/* District Badge */}
          {getDistrict(address) && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
              {getDistrict(address)}
            </div>
          )}

            <div
              className={`absolute top-2 left-2 ${getRatingColorClass(
                avg_rating
              )} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1`}
            >
              <Star size={10} fill="currentColor" />
              {formatRating(avg_rating)}
            </div>
          )}

          {category && (
            <div className="absolute top-10 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              {category}
            </div>
          )}

          {/* Distance Badge (for Near Me) */}
          {distance && (
            <div className="absolute bottom-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <MapPin size={10} />
              {distance} km
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>

          <div className="flex items-start gap-1.5 mb-2 text-gray-500 text-sm">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{address || "Chưa có địa chỉ"}</span>
          </div>

          {/* Spacer to push content below to bottom */}
          <div className="flex-1" />

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs">
              {/* Open Status Badge */}
              {openStatus.status !== 'unknown' && (
                <span className={`px-2 py-1 rounded-full font-semibold border ${getStatusBadgeClasses(openStatus.statusColor)}`}>
                  {openStatus.statusText}
                </span>
              )}
              {openStatus.status === 'unknown' && opening_hours && (
                <div className="flex items-center gap-1 text-gray-500 font-medium">
                  <Clock size={12} />
                  <span>{opening_hours}</span>
                </div>
              )}
            </div>
            
            {price_range && price_range !== "Đang cập nhật" && (
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                    <DollarSign size={12} />
                    {price_range}
                </div>
            )}
          </div>
          
           {/* Custom Action (e.g. Add to Tour) - Always at bottom */}
           {action && (
              <div className="mt-3 pt-2 border-t border-gray-50 flex justify-end">
                  {action}
              </div>
           )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
