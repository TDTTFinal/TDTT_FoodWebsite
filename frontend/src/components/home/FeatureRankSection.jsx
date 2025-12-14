import React, { useState, useEffect } from "react";
import api from "../../config/api";
import RestaurantCard from "../RestaurantCard";
import SkeletonCard from "../SkeletonCard";
import { Camera, Coins } from "lucide-react";

// Reusable component for "Best Space" or "Cheap Eats"
const FeatureRankSection = ({ type }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    space: {
      title: "Top Không gian - Sống ảo 📸",
      icon: <Camera className="text-purple-500" />,
      bg: "bg-purple-50",
    },
    cheap: {
      title: "Hôm nay ăn rẻ 💸",
      icon: <Coins className="text-green-600" />,
      bg: "bg-green-50",
    },
  };

  const { title, icon, bg } = config[type] || config.space;

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.get(`/collections?type=${type}`);
        if (res.success) {
          setRestaurants(res.data);
        }
      } catch (err) {
        console.error(`Fetch ${type} error:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [type]);

  if (!loading && restaurants.length === 0) return null;

  return (
    <section className={`py-8 ${bg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          {icon}
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : restaurants.slice(0, 4).map((res) => (
                <RestaurantCard key={res._id} restaurant={res} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureRankSection;
