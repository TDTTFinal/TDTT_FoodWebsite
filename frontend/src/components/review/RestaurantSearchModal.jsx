import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Star, History, TrendingUp } from 'lucide-react';
import api from '../../config/api';

const RestaurantSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // Load recent from local storage
      const saved = localStorage.getItem('recent_restaurant_searches');
      if (saved) setRecent(JSON.parse(saved));
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Use the advanced search API with fallback
        const res = await api.get(`/search/advanced?q=${query}&type=restaurant`);
        if (res.success || res.status === 200) {
           // Adjust based on actual API response structure
           // searchRoutes typically returns { success: true, data: { restaurants: [...] } } or flat array
           setResults(res.data?.restaurants || res.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (restaurant) => {
    // Save to recent
    const newRecent = [restaurant, ...recent.filter(r => r._id !== restaurant._id)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem('recent_restaurant_searches', JSON.stringify(newRecent));
    
    onSelect(restaurant);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header / Search Input */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-base outline-none text-gray-800 placeholder:text-gray-400"
            placeholder="Tìm nhà hàng, quán ăn..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
               <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
               Đang tìm kiếm...
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-1">
                {results.map(res => (
                  <div 
                    key={res._id}
                    onClick={() => handleSelect(res)}
                    className="flex items-start gap-3 p-3 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors group"
                  >
                     <img 
                        src={res.images?.[0] || res.avatar_url || "https://placehold.co/100x100?text=Food"} 
                        alt={res.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                     />
                     <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 truncate">{res.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                           <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                              <Star size={10} className="fill-current" /> {res.avg_rating?.toFixed(1) || "New"}
                           </span>
                           <span>•</span>
                           <span className="truncate flex items-center gap-0.5">
                              <MapPin size={10} /> {res.address}
                           </span>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-500">
                Không tìm thấy kết quả nào cho "{query}"
              </div>
            )
          ) : (
            // Default View: Recent
            <div className="space-y-4 p-2">
               {recent.length > 0 && (
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <History size={12} /> Gần đây
                    </h3>
                    <div className="space-y-1">
                      {recent.map(res => (
                        <div 
                          key={res._id}
                          onClick={() => handleSelect(res)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        >
                           <img 
                              src={res.images?.[0] || res.avatar_url || "https://placehold.co/100x100?text=Food"} 
                              alt={res.name}
                              className="w-8 h-8 rounded-full object-cover"
                           />
                           <div className="flex-1 truncate text-sm font-medium text-gray-700">
                              {res.name}
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}
               
               {/* Quick Suggestion (Hardcoded for now or fetch trending) */}
               <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp size={12} /> Gợi ý
                  </h3>
                   <p className="text-sm text-gray-400 italic">Hãy nhập tên quán để bắt đầu review...</p>
               </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-500">
           Không tìm thấy quán? <button className="text-orange-600 font-semibold hover:underline">Tạo địa điểm mới</button>
        </div>

      </div>
    </div>
  );
};

export default RestaurantSearchModal;
