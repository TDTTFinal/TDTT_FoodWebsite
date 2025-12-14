import React, { useState, useEffect } from "react";
import api from "../../config/api";
import RestaurantCard from "../RestaurantCard";
import SkeletonCard from "../SkeletonCard";
import { MapPin } from "lucide-react";

const NearMeSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchNearby(latitude, longitude);
        },
        (err) => {
          console.error("Geo error:", err);
          setError("Không thể lấy vị trí của bạn.");
          setLoading(false);
        }
      );
    } else {
      setError("Trình duyệt không hỗ trợ Geolocation.");
      setLoading(false);
    }
  }, []);

  const fetchNearby = async (lat, lon) => {
    try {
      const res = await api.get("/nearby", {
        params: { lat, lon, radius: 5000 },
      });
      setRestaurants(res.data || []);
    } catch (err) {
      console.error("Fetch nearby error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) return null; // Hide section if no location

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800">Gần bạn nhất</h2>
          {location && (
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
              Cách 5km
            </span>
          )}
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="min-w-[280px] snap-center">
                  <SkeletonCard />
                </div>
              ))
            : restaurants.map((res) => (
                <div key={res._id} className="min-w-[280px] w-[280px] snap-center">
                  <RestaurantCard restaurant={res} />
                </div>
              ))}
          
          {!loading && restaurants.length === 0 && (
            <div className="text-gray-500 italic">
              Không tìm thấy nhà hàng nào quanh đây.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NearMeSection;
