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
    // Set timeout for geolocation - if takes too long, use default HCM location
    const geoTimeout = setTimeout(() => {
      console.log("Geolocation timeout - using default HCM location");
      const defaultLat = 10.762622;
      const defaultLon = 106.660172;
      setLocation({ lat: defaultLat, lon: defaultLon });
      fetchNearby(defaultLat, defaultLon);
    }, 5000); // 5 second timeout

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(geoTimeout);
          const { latitude, longitude } = position.coords;
          console.log("Got user location:", latitude, longitude);
          setLocation({ lat: latitude, lon: longitude });
          fetchNearby(latitude, longitude);
        },
        (err) => {
          clearTimeout(geoTimeout);
          console.error("Geo error:", err);
          // Use default HCM center as fallback
          console.log("Using fallback HCM location");
          const defaultLat = 10.762622;
          const defaultLon = 106.660172;
          setLocation({ lat: defaultLat, lon: defaultLon });
          fetchNearby(defaultLat, defaultLon);
        },
        {
          timeout: 5000,
          maximumAge: 300000, // 5 minutes cache
          enableHighAccuracy: false
        }
      );
    } else {
      clearTimeout(geoTimeout);
      // Fallback to HCM center
      const defaultLat = 10.762622;
      const defaultLon = 106.660172;
      setLocation({ lat: defaultLat, lon: defaultLon });
      fetchNearby(defaultLat, defaultLon);
    }

    return () => clearTimeout(geoTimeout);
  }, []);

  const fetchNearby = async (lat, lon) => {
    try {
      const res = await api.get("/restaurants/nearby", {
        params: { lat, lon, radius: 5000 },
      });
      setRestaurants(res.data || []);
    } catch (err) {
      console.error("Fetch nearby error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Return string "1.5"
  };

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <MapPin className="inline-block mr-2 mb-1" size={18} />
            Không thể lấy vị trí: {error}
            <br />
            <small className="text-gray-500">Hãy kiểm tra quyền truy cập vị trí trên trình duyệt.</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800">Gần bạn nhất</h2>
          {location && (
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
              Trong bán kính 5km
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
            : restaurants.map((res) => {
                const dist =
                  location &&
                  res.location?.coordinates
                    ? calculateDistance(
                        location.lat,
                        location.lon,
                        res.location.coordinates[1], // Mongo: [lon, lat] -> [1] is lat
                        res.location.coordinates[0]
                      )
                    : null;
                
                // Clone object to inject distance without mutating state deeply
                const resWithDistance = { ...res, distance: dist };

                return (
                  <div key={res._id} className="min-w-[280px] w-[280px] snap-center">
                    <RestaurantCard restaurant={resWithDistance} />
                  </div>
                );
              })}
          
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
