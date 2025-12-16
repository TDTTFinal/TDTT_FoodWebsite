import React from 'react';

const SkeletonFeedReviewCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="flex-1">
             <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
             <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pb-2">
         <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
         <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
         <div className="h-3 bg-gray-100 rounded w-5/6"></div>
      </div>

      {/* Image Skeleton */}
      <div className="mt-3 w-full h-64 bg-gray-200"></div>

      {/* Actions Skeleton */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-2">
         <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-gray-100"></div>
             <div className="w-20 h-8 rounded-full bg-gray-100"></div>
         </div>
         <div className="w-8 h-8 rounded-full bg-gray-100"></div>
      </div>
    </div>
  );
};

export default SkeletonFeedReviewCard;
