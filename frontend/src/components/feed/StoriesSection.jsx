import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const StoriesSection = ({ topUsers = [], currentUser, onCreateStory }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 overflow-hidden">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        
        {/* Create Story (First Item) */}
        {currentUser && (
          <button
            onClick={onCreateStory}
            className="flex-shrink-0 flex flex-col items-center gap-1 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-orange-100 group-hover:to-amber-100 transition-all duration-300">
                <img 
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                  alt="Your story"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Plus size={14} className="text-white" />
              </div>
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
              Tạo mới
            </span>
          </button>
        )}

        {/* User Stories */}
        {topUsers.map((user, idx) => (
          <Link
            key={user._id}
            to={`/user/${user._id}`}
            className="flex-shrink-0 flex flex-col items-center gap-1 group"
          >
            {/* Story Ring with Gradient */}
            <div className="relative">
              <div 
                className={`w-16 h-16 rounded-full p-[3px] ${
                  idx < 3 
                    ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-500' 
                    : 'bg-gradient-to-tr from-gray-300 to-gray-400'
                } group-hover:scale-105 transition-transform duration-300`}
              >
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
                    }}
                  />
                </div>
              </div>
              
              {/* Badge for top 3 */}
              {idx < 3 && (
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-bold text-white shadow-sm ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                }`}>
                  {idx + 1}
                </div>
              )}
            </div>
            
            {/* Username */}
            <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors truncate w-16 text-center">
              {user.name?.split(' ').pop() || 'User'}
            </span>
          </Link>
        ))}

        {/* Show more indicator if many users */}
        {topUsers.length > 6 && (
          <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1 opacity-50">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-bold">+{topUsers.length - 6}</span>
            </div>
            <span className="text-xs text-gray-400">Xem thêm</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesSection;
