import React, { useState } from 'react';
import { DndContext, closestCorners, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TimelineSlot from './TimelineSlot';
import TourMap from './TourMap';
import TourItemCard from './TourItemCard';
import { Sun, Coffee, Sunset, Moon, Inbox } from 'lucide-react';

const Slots = {
    unsorted: { title: 'Chưa sắp xếp', icon: <Inbox size={16} className="text-gray-500" /> },
    morning: { title: 'Buổi Sáng', icon: <Sun size={16} className="text-green-500" /> },
    lunch: { title: 'Buổi Trưa', icon: <Coffee size={16} className="text-yellow-500" /> },
    afternoon: { title: 'Buổi Chiều', icon: <Sunset size={16} className="text-orange-500" /> },
    dinner: { title: 'Buổi Tối', icon: <Moon size={16} className="text-purple-500" /> }
};

const TourBuilder = ({ tourItems, onDragOver, onDragEnd, onRemove }) => {
    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);
        setActiveItem(active.data.current?.restaurant);
    };

    const handleDragEndInternal = (event) => {
        setActiveId(null);
        setActiveItem(null);
        onDragEnd(event);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
            active: {
                opacity: '0.5',
            },
            },
        }),
    };

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                🗺️ Food Tour Planner
                <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    Kéo thả để sắp xếp
                </span>
            </h3>
        </div>

        {/* Content: Timeline + Map (Stacked) */}
        <div className="flex flex-col">
            {/* Timeline Section */}
            <div className="p-4 bg-gray-50/30 border-b border-gray-100">
                <DndContext
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={handleDragEndInternal}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {Object.entries(Slots).map(([key, info]) => (
                            <TimelineSlot
                                key={key}
                                id={key}
                                title={info.title}
                                icon={info.icon}
                                items={tourItems[key]}
                                onRemove={onRemove}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeItem ? (
                             <div className="opacity-80 rotate-2">
                                <TourItemCard restaurant={activeItem} />
                             </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Map Section */}
            <div className="h-[400px] relative">
                 <TourMap tourItems={tourItems} />
            </div>
        </div>
    </div>
  );
};

export default TourBuilder;
