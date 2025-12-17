import React from 'react';

const SkeletonFeedReviewCard = () => {
  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton with ring effect */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 bg-gray-200 rounded-full w-24" />
            <div className="h-2.5 bg-gray-100 rounded-full w-32" />
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-gray-100" />
      </div>

      {/* Image Skeleton - Instagram aspect-square */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      {/* Actions Skeleton */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-6 h-6 rounded-full bg-gray-200" />
          <div className="w-6 h-6 rounded-full bg-gray-200" />
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-200" />
      </div>

      {/* Likes Skeleton */}
      <div className="px-4 pb-1">
        <div className="h-3 bg-gray-200 rounded-full w-20" />
      </div>

      {/* Caption Skeleton */}
      <div className="px-4 pb-2 space-y-2">
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>

      {/* Timestamp Skeleton */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-gray-100 rounded-full w-16" />
      </div>
    </article>
  );
};

export default SkeletonFeedReviewCard;
