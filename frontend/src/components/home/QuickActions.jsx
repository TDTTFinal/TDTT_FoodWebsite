import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Flame, Coffee, Ticket, PartyPopper } from "lucide-react";

// Icon mapping
const actions = [
  { name: "Đặt bàn", icon: <Ticket size={24} />, path: "/explore", color: "bg-orange-100 text-orange-600" },
  { name: "Giao hàng", icon: <Utensils size={24} />, path: "/explore", color: "bg-blue-100 text-blue-600" },
  { name: "Coffee", icon: <Coffee size={24} />, path: "/category/Cafe", color: "bg-amber-100 text-amber-700" },
  { name: "BBQ", icon: <Flame size={24} />, path: "/category/BBQ", color: "bg-red-100 text-red-600" },
  { name: "Party", icon: <PartyPopper size={24} />, path: "/explore", color: "bg-purple-100 text-purple-600" },
];

const QuickActions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start gap-4 overflow-x-auto pb-2 no-scrollbar">
        {actions.map((action, idx) => (
          <Link
            to={action.path}
            key={idx}
            className="flex flex-col items-center min-w-[70px] group cursor-pointer"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-sm transition-transform transform group-hover:scale-110 ${action.color}`}
            >
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {action.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
