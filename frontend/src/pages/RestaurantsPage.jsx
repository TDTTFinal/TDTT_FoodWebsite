import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, TrendingUp, Award, RefreshCw, Flame } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedReviewCard from "../components/feed/FeedReviewCard";
import SkeletonFeedReviewCard from "../components/feed/SkeletonFeedReviewCard";
import ReviewDetailModal from "../components/feed/ReviewDetailModal";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FoodFeedPage = () => {
  const [reviews, setReviews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewIdFromUrl = searchParams.get('review');
  
  // ... (rest of state)

  // === DEEP LINKING HANDLER ===
  useEffect(() => {
    const syncModalWithUrl = async () => {
        // Case 1: URL has ID but no Modal Open -> Fetch & Open
        // Case 2: URL has ID and Modal Open (Mismatch) -> Fetch correct & Open
        if (reviewIdFromUrl) {
            if (selectedReview && selectedReview._id === reviewIdFromUrl) return;

            try {
                // Check if we already have it in the list to avoid fetch?
                const existing = reviews.find(r => r._id === reviewIdFromUrl);
                if (existing) {
                    setSelectedReview(existing);
                } else {
                    const res = await fetch(`http://localhost:5000/api/reviews/${reviewIdFromUrl}`);
                    const data = await res.json();
                    if (data.success) setSelectedReview(data.data);
                }
            } catch (e) {
                console.error("Deep link fetch error:", e);
            }
        } 
        // Case 3: URL has NO ID but Modal Open -> Close
        else if (selectedReview) {
            setSelectedReview(null);
        }
    };
    syncModalWithUrl();
  }, [reviewIdFromUrl, reviews]); // Add reviews to dependency to catch list update if needed

  const openReviewModal = (review) => {
    setSearchParams(prev => {
        prev.set('review', review._id);
        return prev;
    });
    // State update will happen via useEffect above or we can set it optimistically?
    // Better let useEffect handle it for consistency, but to avoid flash, maybe set it?
    // If we set it here, useEffect will see ID match and do nothing. Perfect.
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    setSearchParams(prev => {
        prev.delete('review');
        return prev;
    });
    setSelectedReview(null);
  };

  // Callback to update a review in the list when liked/updated in modal
  const updateReviewInList = (updatedReview) => {
    setReviews(prev => prev.map(r => 
      r._id === updatedReview._id ? { ...r, ...updatedReview } : r
    ));
    // Also update selectedReview if it's the same
    if (selectedReview && selectedReview._id === updatedReview._id) {
      setSelectedReview(prev => ({ ...prev, ...updatedReview }));
    }
  };


  
  const [sortMode, setSortMode] = useState('latest');

  const [loading, setLoading] = useState(true); // Initial load
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  // Sentinel for Infinite Scroll
  const observer = useRef();
  const lastReviewElementRef = useCallback(node => {
     // ... (unchanged)
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Check auth
  // ... (unchanged)

  // === FETCH SIDEBAR DATA ===
  useEffect(() => {
    const fetchSidebarData = async () => {
        try {
            setLoadingSidebar(true);
            const [trendingRes, usersRes] = await Promise.all([
                fetch('http://localhost:5000/api/restaurants/trending').then(r => r.json()),
                fetch('http://localhost:5000/api/reviews/top-users').then(r => r.json())
            ]);

            if (trendingRes.success) setTrending(trendingRes.data);
            if (usersRes.success) setTopUsers(usersRes.data);
        } catch (err) {
            console.error("Sidebar fetch error:", err);
        } finally {
            setLoadingSidebar(false);
        }
    };
    fetchSidebarData();
  }, []);

  // === FETCH FEED ===
  useEffect(() => {
     // Reset list when sort changes is handled by setting page=1? 
     // No, we need to clear list.
     // Better strategy: Use [page, sortMode] dependency.
     // If sortMode changes -> setPage(1), setReviews([]).
     fetchFeed(page, sortMode);
  }, [page, sortMode]);

  const handleSortChange = (mode) => {
      if (mode === sortMode) return;
      setSortMode(mode);
      setPage(1);
      setReviews([]);
      setHasMore(true);
      // useEffect will trigger fetchFeed(1, mode)
  };

  const fetchFeed = async (pageNum, sort) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`http://localhost:5000/api/reviews/feed?page=${pageNum}&limit=5&sort=${sort}`);
      const data = await res.json();

      if (data.success) {
        setReviews(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        
        if (data.data.length < 5 || (data.pagination && pageNum >= data.pagination.totalPages)) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Feed error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
      setPage(1);
      setHasMore(true);
      setReviews([]); 
      fetchFeed(1, sortMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            
            {/* === LEFT COLUMN: FEED === */}
            <div className="w-full lg:w-2/3">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">Bảng tin</h1>
                        <div className="flex bg-gray-200 p-1 rounded-full">
                            <button 
                                onClick={() => handleSortChange('latest')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${sortMode === 'latest' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >Mới nhất</button>
                            <button 
                                onClick={() => handleSortChange('trending')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${sortMode === 'trending' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >Nổi bật</button>
                        </div>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                        title="Làm mới"
                    >
                        <RefreshCw size={20} className="text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* FEED LIST */}
                    {/* FEED LIST */}
                    {/* FEED LIST */}
                    {reviews.map((review, index) => (
                        <div key={review._id} ref={index === reviews.length - 1 ? lastReviewElementRef : null}>
                            <FeedReviewCard 
                                review={review} 
                                onClick={() => openReviewModal(review)}
                                onReviewUpdate={updateReviewInList}
                            />
                        </div>
                    ))}

                    {/* SKELETON LOADING (Initial or More) */}
                    {(loading || loadingMore) && (
                        <>
                            <SkeletonFeedReviewCard />
                            <SkeletonFeedReviewCard />
                            {loading && <SkeletonFeedReviewCard />} 
                        </>
                    )}

                    {/* END OF FEED */}
                    {!hasMore && reviews.length > 0 && !loading && (
                        <div className="text-center py-8">
                             <div className="inline-block p-4 rounded-full bg-white shadow-sm border border-gray-100">
                                <span className="text-2xl">🎉</span>
                             </div>
                             <p className="text-gray-500 mt-2 text-sm">Bạn đã xem hết bài viết hôm nay!</p>
                        </div>
                    )}
                    
                     {/* EMPTY STATE */}
                     {!loading && reviews.length === 0 && (
                         <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                             <p className="text-gray-500">Chưa có bài viết nào.</p>
                             <button onClick={handleRefresh} className="mt-4 text-orange-500 font-bold hover:underline">Thử lại</button>
                         </div>
                     )}
                </div>
            </div>

            {/* === RIGHT COLUMN: SIDEBAR (Desktop Only) === */}
            <div className="hidden lg:block w-1/3">
                <div className="sticky top-24 space-y-6">
                
                {/* TRENDING RESTAURANTS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-2">
                        <Flame className="text-red-500 fill-red-500" size={20} />
                        <h3 className="font-bold text-gray-800">Top Thịnh Hành</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {loadingSidebar ? (
                            <div className="animate-pulse space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex gap-3"><div className="w-12 h-12 bg-gray-200 rounded-lg"></div><div className="flex-1 space-y-2"><div className="h-3 bg-gray-200 w-3/4"></div><div className="h-2 bg-gray-200 w-1/2"></div></div></div>
                                ))}
                            </div>
                        ) : trending.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4 italic">Chưa có thông tin tuần này.</p>
                        ) : (
                            trending.map((res, idx) => (
                                <Link to={`/restaurant/${res._id}`} key={res._id} className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors">
                                    <span className="font-black text-gray-300 text-lg w-4 text-center group-hover:text-orange-500 transition-colors">{idx + 1}</span>
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                         <img src={res.images?.[0] || res.avatar_url || "https://placehold.co/100"} alt={res.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-orange-600 transition-colors">{res.name}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center text-amber-500 font-bold"><Award size={10} className="mr-0.5"/>{res.avg_rating?.toFixed(1)}</span>
                                            <span>•</span>
                                            <span className="truncate">{res.address?.split(',')[0]}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* TOP REVIEWERS */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="text-indigo-600" size={20} />
                        <h3 className="font-bold text-indigo-900">Top Reviewers</h3>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                         {loadingSidebar ? (
                            [1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/50 animate-pulse"></div>)
                         ) : topUsers.length === 0 ? (
                            <p className="col-span-5 text-xs text-indigo-400 text-center py-2 italic">Chưa có reviewer nổi bật.</p>
                         ) : (
                             topUsers.map((user) => (
                                 <Link to={`/user/${user._id}`} key={user._id} className="relative group cursor-pointer" title={`${user.name} (${user.reviewCount} reviews)`}>
                                     <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform object-cover" alt={user.name} />
                                     <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                         {user.reviewCount}
                                     </div>
                                 </Link>
                             ))
                         )}
                    </div>
                </div>

                </div>
            </div>

        </div>
      </main>

      {/* MODAL */}
      {selectedReview && (
        <ReviewDetailModal 
            review={selectedReview} 
            currentUser={currentUser}
            onClose={closeReviewModal}
            onReviewUpdate={updateReviewInList}
        />
      )}

      <Footer />
    </div>
  );
};

export default FoodFeedPage;
