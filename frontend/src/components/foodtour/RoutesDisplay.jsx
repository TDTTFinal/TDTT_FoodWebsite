import React from 'react';
import { MapPin, TrendingUp, Navigation } from 'lucide-react';

const RoutesDisplay = ({ routes, onApplyRoute }) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-6">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-800 mb-1">🗺️ Các Route gợi ý</h3>
        <p className="text-sm text-gray-500">Chọn route phù hợp để thêm vào Food Tour của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div
            key={route.route_id}
            className="border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg transition-all group"
          >
            {/* Route Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">{route.route_id.replace('_', ' ').toUpperCase()}</h4>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                  {route.total_distance?.toFixed(2) || 0} km
                </span>
                {route.total_score !== undefined && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center gap-1">
                    <TrendingUp size={10} />
                    {route.total_score.toFixed(3)}
                  </span>
                )}
              </div>
            </div>

            {/* Stops */}
            <div className="space-y-2 mb-4">
              {route.stops.map((stop, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {/* Step Indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    {idx < route.stops.length - 1 && (
                      <div className="w-0.5 h-8 bg-orange-200"></div>
                    )}
                  </div>

                  {/* Stop Info */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-semibold text-sm text-gray-800 truncate">{stop.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                      <MapPin size={10} />
                      {stop.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => onApplyRoute(route)}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-lg hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-105"
            >
              <Navigation size={16} />
              Đổ route này vào Food Tour
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesDisplay;
