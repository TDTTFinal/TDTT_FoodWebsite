import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TourItemCard from './TourItemCard';
import { Clock } from 'lucide-react';

const TimelineSlot = ({ id, title, icon, items, onRemove }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div 
        ref={setNodeRef}
        className={`flex-1 min-w-[280px] md:min-w-0 md:w-full bg-gray-50 rounded-2xl p-4 border-2 transition-colors ${
            isOver ? 'border-orange-400 bg-orange-50' : 'border-dashed border-gray-200'
        }`}
    >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 text-gray-500 font-bold uppercase text-xs tracking-wider">
            {icon || <Clock size={16} />} 
            {title}
            <span className="ml-auto bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
                {items.length}
            </span>
        </div>

        {/* List */}
        <div className="min-h-[100px]">
            <SortableContext 
                id={id} 
                items={items.map(item => item.cartId)} // Use unique cartId for sortable
                strategy={verticalListSortingStrategy}
            >
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-300 text-sm font-medium italic">
                        Kéo thả quán vào đây
                    </div>
                ) : (
                    items.map((item) => (
                        <TourItemCard 
                            key={item.cartId} 
                            id={item.cartId} 
                            restaurant={item} 
                            onRemove={onRemove}
                        />
                    ))
                )}
            </SortableContext>
        </div>
    </div>
  );
};

export default TimelineSlot;
