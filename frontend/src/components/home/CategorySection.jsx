import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Coffee, Pizza, Cherry, Beef, Soup, Fish, Beer, Leaf, Flame } from "lucide-react";

const categories = [
  { id: "com", name: "Cơm & Món Mặn", icon: <Utensils size={24}/>, color: "bg-orange-100 text-orange-600" },
  { id: "nuoc", name: "Món Nước & Sợi", icon: <Soup size={24}/>, color: "bg-yellow-100 text-yellow-600" },
  { id: "drinks", name: "Cafe & Trà Sữa", icon: <Coffee size={24}/>, color: "bg-green-100 text-green-600" },
  { id: "snack", name: "Ăn Vặt & Bánh", icon: <Pizza size={24}/>, color: "bg-pink-100 text-pink-600" },
  { id: "party", name: "Lẩu - Nướng & Nhậu", icon: <Beer size={24}/>, color: "bg-red-100 text-red-600" },
  { id: "healthy", name: "Healthy & Khác", icon: <Leaf size={24}/>, color: "bg-emerald-100 text-emerald-600" },
];

const CategorySection = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh mục món ăn</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center truncate w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
