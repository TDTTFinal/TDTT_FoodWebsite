import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyService } from '../services/historyService';
import { Clock, MessageSquare, MapPin, Star, Calendar } from 'lucide-react';

const History = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'review'
  const [historyList, setHistoryList] = useState([]);
  const [reviewList, setReviewList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history data
  useEffect(() => {
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'view') {
        // 1. Load local history first (instant)
        const local = historyService.getLocalHistory();
        setHistoryList(local);

        // 2. If logged in, sync and fetch server history
        if (user) {
          await historyService.syncHistory();
          const serverHistory = await historyService.getViewHistory();
          // Merge logic or just prefer server if available? 
          // Server history includes more details if populated correctly.
          // Let's use server history if available and not empty, otherwise local.
          if (serverHistory && serverHistory.length > 0) {
            setHistoryList(serverHistory);
          }
        }
      } else if (activeTab === 'review') {
        if (user) {
          const reviews = await historyService.getReviewHistory();
          setReviewList(reviews);
        } else {
          setReviewList([]);
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

  // Components for tabs
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
        activeTab === id
          ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
          : "bg-white text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="page-wrapper min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">
            Lịch sử hoạt động
          </h1>
          
          <div className="flex gap-3 bg-gray-200/50 p-1.5 rounded-full">
            <TabButton id="view" label="Đã xem gần đây" icon={Clock} />
            <TabButton id="review" label="Lịch sử đánh giá" icon={MessageSquare} />
          </div>
        </div>

        {/* VIEW HISTORY TAB */}
        {activeTab === 'view' && (
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
        )}

        {/* REVIEW HISTORY TAB */}
        {activeTab === 'review' && (
          <div className="review-history-section">
            {!user ? (
               <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h3>
                <p className="text-gray-500 mb-6">Bạn cần đăng nhập để xem lại các đánh giá đã viết.</p>
                <Link to="/login" className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors">
                  Đăng nhập ngay
                </Link>
              </div>
            ) : reviewList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có đánh giá nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa viết đánh giá cho quán ăn nào cả.</p>
                <Link to="/explore" className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors">
                  Viết đánh giá ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                 {reviewList.map(review => (
                   <div key={review.reviewId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                     <div className="flex gap-4">
                       <Link to={`/restaurant/${review.restaurantId}`} className="shrink-0 w-24 h-24 rounded-lg overflow-hidden block">
                         <img 
                            src={review.restaurantImg || "https://placehold.co/100x100"} 
                            alt={review.restaurantName} 
                            className="w-full h-full object-cover"
                         />
                       </Link>
                       <div className="flex-1">
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-bold text-lg text-gray-800">
                               <Link to={`/restaurant/${review.restaurantId}`} className="hover:text-orange-600">
                                 {review.restaurantName}
                               </Link>
                             </h3>
                             <p className="text-sm text-gray-500 flex items-center gap-1">
                               <MapPin size={12} /> {review.restaurantAddress}
                             </p>
                           </div>
                           <span className="text-xs text-gray-400 flex items-center gap-1">
                             <Calendar size={12} />
                             {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                           </span>
                         </div>
                         
                         <div className="flex items-center gap-1 my-2">
                           {[...Array(5)].map((_, i) => (
                             <Star 
                               key={i} 
                               size={14} 
                               className={i < review.rating ? "text-yellow-400" : "text-gray-300"} 
                               fill={i < review.rating ? "currentColor" : "none"}
                             />
                           ))}
                         </div>
                         
                         <p className="text-gray-600 text-sm line-clamp-2 italic">"{review.content}"</p>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}

      </div>
      
      <Footer />
    </div>
  );
};

export default History;