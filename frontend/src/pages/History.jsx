import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';
import { Clock, MapPin, Star } from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history data
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load local history first (instant)
      const local = historyService.getLocalHistory();
      setHistoryList(local);

      // 2. If logged in, sync and fetch server history
      if (user) {
        await historyService.syncHistory();
        const serverHistory = await historyService.getViewHistory();
        if (serverHistory && serverHistory.length > 0) {
          setHistoryList(serverHistory);
        }
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử xem?")) {
      historyService.clearLocalHistory();
      if (user) {
        await historyService.clearViewHistory();
      }
      setHistoryList([]);
    }
  };

  const removeItem = async (id, e) => {
    e.preventDefault(); // prevents Link navigation
    e.stopPropagation();
    
    // Remove from local
    historyService.removeFromLocalHistory(id);
    
    // Remove from server if logged in
    if (user) {
      await historyService.removeViewHistory(id);
    }

    // Update UI
    setHistoryList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="page-wrapper min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">
            Lịch sử hoạt động
          </h1>
        </div>

        <div className="view-history-section">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500">
              {historyList.length > 0 
                ? `Tìm thấy ${historyList.length} địa điểm đã xem` 
                : "Chưa có lịch sử xem nào"}
            </p>
            {historyList.length > 0 && (
              <button 
                onClick={handleClearHistory} 
                className="text-red-500 hover:text-red-700 text-sm font-semibold hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4">👀</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa xem quán nào</h3>
              <p className="text-gray-500 mb-6">Hãy dạo một vòng khám phá các quán ngon nhé!</p>
              <Link to="/explore" className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors">
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyList.map(item => (
                <Link 
                  to={`/restaurant/${item.id}`} 
                  key={item.id} 
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.img || "https://placehold.co/400x300"} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                          e.target.src = "https://placehold.co/400x300/FFF3E0/E65100?text=Food";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <button 
                        onClick={(e) => removeItem(item.id, e)}
                        className="p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        title="Xóa khỏi lịch sử"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    {item.viewedAt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                        <span className="text-xs text-white/90 flex items-center gap-1">
                          <Clock size={12} />
                          Đã xem: {new Date(item.viewedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                      {item.rating > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" />
                          {item.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-1 line-clamp-1">
                      <MapPin size={14} />
                      {item.address}
                    </p>
                    
                    <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
                        {item.category || "Nhà hàng"}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                        Đặt lại &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default History;