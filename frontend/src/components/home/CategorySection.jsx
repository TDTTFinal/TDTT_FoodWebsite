import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Coffee, Pizza, Cherry, Beef, Soup, Fish, Beer } from "lucide-react";

const categories = [
  { id: "Lẩu", name: "Lẩu", icon: <Soup size={24}/>, color: "bg-red-100 text-red-600" },
  { id: "BBQ", name: "BBQ", icon: <Beef size={24}/>, color: "bg-orange-100 text-orange-600" },
  { id: "Cơm", name: "Cơm", icon: <Utensils size={24}/>, color: "bg-yellow-100 text-yellow-600" },
  { id: "Trà sữa", name: "Trà sữa", icon: <Coffee size={24}/>, color: "bg-blue-100 text-blue-600" },
  { id: "Cafe", name: "Cafe", icon: <Coffee size={24}/>, color: "bg-amber-100 text-amber-700" },
  { id: "Hải sản", name: "Hải sản", icon: <Fish size={24}/>, color: "bg-cyan-100 text-cyan-600" },
  { id: "Buffet", name: "Buffet", icon: <Utensils size={24}/>, color: "bg-emerald-100 text-emerald-600" },
  { id: "Pizza", name: "Pizza", icon: <Pizza size={24}/>, color: "bg-rose-100 text-rose-600" },
  { id: "Ăn vặt", name: "Ăn vặt", icon: <Cherry size={24}/>, color: "bg-pink-100 text-pink-600" },
  { id: "Nhậu", name: "Quán nhậu", icon: <Beer size={24}/>, color: "bg-purple-100 text-purple-600" },
];

const CategorySection = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh mục món ăn</h2>
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-4">
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
