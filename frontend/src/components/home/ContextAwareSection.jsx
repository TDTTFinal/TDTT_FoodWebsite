import React, { useState, useEffect } from "react";
import api from "../../config/api";
import RestaurantCard from "../RestaurantCard";
import SkeletonCard from "../SkeletonCard";
import { Sparkles } from "lucide-react";

const ContextAwareSection = () => {
  const [data, setData] = useState({ title: "Gợi ý hôm nay", list: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await api.get("/contextual");
        if (res.success) {
          setData({
            title: res.context.title,
            list: res.data,
          });
        }
      } catch (err) {
        console.error("Context fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, []);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">{data.title}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : data.list.map((res) => (
                <RestaurantCard key={res._id} restaurant={res} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default ContextAwareSection;
