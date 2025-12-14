import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, DollarSign } from "lucide-react";

const RestaurantCard = ({ restaurant }) => {
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

          {/* District Badge */}
          {getDistrict(address) && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
              {getDistrict(address)}
            </div>
          )}

          {/* Rating Badge */}
          {avg_rating > 0 && (
            <div
              className={`absolute top-2 right-2 ${getRatingColorClass(
                avg_rating
              )} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1`}
            >
              <Star size={10} fill="currentColor" />
              {formatRating(avg_rating)}
            </div>
          )}

          {category && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
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

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
               {opening_hours && (
                <div className="flex items-center gap-1">
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
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
