import React from "react";

const SkeletonCard = () => {
  return (
    <div className="animate-pulse flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-w-[280px] h-[300px]">
      {/* Image Skeleton */}
      <div className="h-40 bg-gray-200 w-full"></div>
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="h-3 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
