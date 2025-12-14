// frontend/src/components/foodtour/WeatherWarning.jsx
import React from "react";
import { CloudRain, AlertTriangle, Sun, Cloud, CloudSun, Thermometer, X } from "lucide-react";

/**
 * Weather Info Modal/Dialog
 * Shows detailed weather info when adding restaurant to tour
 */
const WeatherWarning = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  restaurantName,
  slotLabel,
  weather,
  message,
}) => {
  if (!isOpen) return null;

  const isRainy = weather?.isRainy || false;
  const precipitation = weather?.precipitation || 0;
  const temperature = weather?.temperature || 0;
  const description = weather?.description || "Đang tải...";
  const icon = weather?.icon || "🌡️";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Color based on weather */}
        <div className={`px-6 py-4 flex items-center gap-3 ${
          isRainy 
            ? "bg-gradient-to-r from-blue-500 to-blue-600" 
            : "bg-gradient-to-r from-orange-400 to-amber-500"
        }`}>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Thông tin thời tiết</h3>
            <p className="text-white/90 text-sm">{description}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Weather stats */}
          <div className="flex justify-center gap-6 mb-5">
            {/* Temperature */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <Thermometer className="text-orange-500" size={28} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{temperature}°C</div>
              <div className="text-xs text-gray-500">Nhiệt độ</div>
            </div>

            {/* Precipitation */}
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 mx-auto ${
                precipitation >= 50 ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <CloudRain className={precipitation >= 50 ? "text-blue-500" : "text-gray-400"} size={28} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{precipitation}%</div>
              <div className="text-xs text-gray-500">Khả năng mưa</div>
            </div>
          </div>

          {/* Location info */}
          <div className="text-center mb-4">
            <span className="text-gray-500">Dự báo </span>
            <span className="font-semibold text-gray-800">{slotLabel}</span>
            <span className="text-gray-500"> tại </span>
            <span className="font-semibold text-orange-600">"{restaurantName}"</span>
          </div>

          {/* Warning or info message */}
          {isRainy ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-amber-800 text-sm font-medium">Lưu ý: Có thể có mưa!</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Gợi ý chọn quán có không gian trong nhà hoặc mái che.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3 items-center">
                <Sun className="text-green-600 shrink-0" size={20} />
                <p className="text-green-800 text-sm">
                  Thời tiết thuận lợi cho việc ra ngoài! 🎉
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {isRainy ? (
              <>
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Chọn quán khác
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-colors shadow-md"
                >
                  Vẫn thêm vào tour
                </button>
              </>
            ) : (
              <button
                onClick={onConfirm}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors shadow-md"
              >
                ✓ Thêm vào tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWarning;
