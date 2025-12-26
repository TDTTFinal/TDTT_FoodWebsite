import React, { useState, useEffect } from "react";
import api from "../../config/api";
import RestaurantCard from "../RestaurantCard";
import SkeletonCard from "../SkeletonCard";
import { MapPin, Navigation } from "lucide-react";
import { getDistanceMatrix, getHaversineDistance } from "../../services/osrmService";

const NearMeSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [roadDistances, setRoadDistances] = useState({});
  const [useRoadDistance, setUseRoadDistance] = useState(true); // Toggle for distance type

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

  const fetchNearby = async (lat, lon, isRetry = false) => {
    try {
      const res = await api.get("/restaurants/nearby", {
        params: { lat, lon, radius: 5000 },
      });
      
      if ((!res.data || res.data.length === 0) && !isRetry) {
         console.log("No restaurants found locally, falling back to default HCMC location");
         const defaultLat = 10.762622;
         const defaultLon = 106.660172;
         setLocation({ lat: defaultLat, lon: defaultLon });
         fetchNearby(defaultLat, defaultLon, true);
         return;
      }

      const fetchedRestaurants = res.data || [];
      setRestaurants(fetchedRestaurants);
      
      // Fetch road distances asynchronously
      if (fetchedRestaurants.length > 0) {
        fetchRoadDistances({ lat, lon }, fetchedRestaurants);
      }
    } catch (err) {
      console.error("Fetch nearby error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch road distances using OSRM
  const fetchRoadDistances = async (origin, restaurantList) => {
    try {
      const destinations = restaurantList.map(r => ({
        lat: r.location?.coordinates?.[1] || r.lat,
        lon: r.location?.coordinates?.[0] || r.lon,
      }));

      const distances = await getDistanceMatrix(origin, destinations);
      
      const distanceMap = {};
      restaurantList.forEach((r, i) => {
        if (distances[i]?.distance !== null) {
          distanceMap[r._id] = {
            distance: distances[i].distance,
            duration: distances[i].duration
          };
        }
      });
      
      setRoadDistances(distanceMap);
    } catch (err) {
      console.error("Road distance fetch error:", err);
    }
  };

  // Haversine formula (fallback)
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    return getHaversineDistance(lat1, lon1, lat2, lon2).toFixed(1);
  };

  // Get distance for a restaurant
  const getDistance = (restaurant) => {
    if (!location) return null;
    
    // Use road distance if available and enabled
    if (useRoadDistance && roadDistances[restaurant._id]) {
      return roadDistances[restaurant._id].distance.toFixed(1);
    }
    
    // Fallback to Haversine
    const lat = restaurant.location?.coordinates?.[1];
    const lon = restaurant.location?.coordinates?.[0];
    return calculateHaversineDistance(location.lat, location.lon, lat, lon);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800">Gần bạn nhất</h2>
            {location && (
              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                Trong bán kính 5km
              </span>
            )}
          </div>
          
          {/* Distance type toggle */}
          <button
            onClick={() => setUseRoadDistance(!useRoadDistance)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              useRoadDistance 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            title={useRoadDistance ? "Đang hiển thị khoảng cách đường đi" : "Đang hiển thị đường chim bay"}
          >
            <Navigation size={12} className={useRoadDistance ? 'text-blue-500' : 'text-gray-400'} />
            {useRoadDistance ? 'Đường đi' : 'Đường thẳng'}
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
          {loading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="min-w-[280px] snap-center">
                  <SkeletonCard />
                </div>
              ))
            : restaurants.map((res) => {
                const dist = getDistance(res);
                const roadData = roadDistances[res._id];
                
                // Clone object to inject distance without mutating state deeply
                const resWithDistance = { 
                  ...res, 
                  distance: dist,
                  // Add road duration if available
                  roadDuration: roadData?.duration 
                };

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
