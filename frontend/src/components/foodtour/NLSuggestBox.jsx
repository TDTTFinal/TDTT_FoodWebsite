import React, { useState } from 'react';
import { MapPin, Loader2, AlertCircle, Send } from 'lucide-react';
import { fetchFoodTourSuggestions } from '../../services/hfApi';

const NLSuggestBox = ({ onResults, onError }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [params, setParams] = useState({ radius: 5, alpha: 0.6, top_k: 5 });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        setError('Không thể lấy vị trí. Vui lòng nhập tọa độ thủ công.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) {
      setError('Vui lòng nhập mô tả món ăn bạn muốn');
      return;
    }

    if (!location.lat || !location.lon) {
      setError('Vui lòng chọn vị trí hoặc nhập tọa độ');
      return;
    }

    setLoading(true);

    try {
      const results = await fetchFoodTourSuggestions({
        q: query,
        lat: location.lat,
        lon: location.lon,
        radius: params.radius,
        alpha: params.alpha,
        top_k: params.top_k
      });

      onResults(results);
    } catch (err) {
      const errorMsg = err.message || 'Có lỗi xảy ra khi gọi API. Vui lòng thử lại.';
      setError(errorMsg);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-800 mb-2">🤖 Gợi ý Food Tour bằng AI</h3>
        <p className="text-sm text-gray-500">Mô tả món ăn bạn muốn bằng ngôn ngữ tự nhiên</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Query Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bạn muốn đi ăn như thế nào?
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ví dụ: "Phở rồi cà phê" hoặc "Cơm tấm trưa rồi trà sữa chiều"'
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vị trí</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {locationLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              {locationLoading ? 'Đang lấy...' : 'Vị trí hiện tại'}
            </button>
            
            <input
              type="number"
              step="0.0001"
              value={location.lat || ''}
              onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
              placeholder="Lat"
              className="w-24 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              step="0.0001"
              value={location.lon || ''}
              onChange={(e) => setLocation({ ...location, lon: parseFloat(e.target.value) })}
              placeholder="Lon"
              className="w-24 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          {location.lat && location.lon && (
            <p className="text-xs text-green-600 mt-1">✓ Vị trí: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
          )}
        </div>

        {/* Advanced Params */}
        <details className="border border-gray-200 rounded-lg p-3">
          <summary className="text-sm font-semibold text-gray-700 cursor-pointer">Tùy chỉnh nâng cao</summary>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Bán kính tìm kiếm: {params.radius} km
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={params.radius}
                onChange={(e) => setParams({ ...params, radius: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Alpha (Semantic/TF-IDF): {params.alpha}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={params.alpha}
                onChange={(e) => setParams({ ...params, alpha: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Số gợi ý mỗi bước: {params.top_k}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={params.top_k}
                onChange={(e) => setParams({ ...params, top_k: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </details>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Đang tạo gợi ý...
            </>
          ) : (
            <>
              <Send size={18} />
              Tạo gợi ý Food Tour
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default NLSuggestBox;
