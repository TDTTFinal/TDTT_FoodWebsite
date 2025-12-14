import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, MapPin } from 'lucide-react';

const TourItemCard = ({ restaurant, id, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id, data: { restaurant } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 group hover:border-orange-200 transition-colors mb-2 touch-none"
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-move text-gray-300 hover:text-orange-500"
      >
        <GripVertical size={16} />
      </div>

      {/* Image Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img 
          src={restaurant.avatar_url || "https://placehold.co/100x100/E0E0E0/999?text=No+Image"} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://placehold.co/100x100/E0E0E0/999?text=No+Image";
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm truncate">{restaurant.name}</h4>
        <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
           <MapPin size={10} />
           {restaurant.address}
        </div>
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button 
          onClick={() => onRemove(id)}
          className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default TourItemCard;
