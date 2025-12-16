import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, TrendingUp, Award, RefreshCw, Flame, Plus, Sparkles, Users } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeedReviewCard from "../components/feed/FeedReviewCard";
import StoriesSection from "../components/feed/StoriesSection";
import SkeletonFeedReviewCard from "../components/feed/SkeletonFeedReviewCard";
import ReviewDetailModal from "../components/feed/ReviewDetailModal";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FoodFeedPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewIdFromUrl = searchParams.get('review');

  // === DEEP LINKING HANDLER ===
  useEffect(() => {
    const syncModalWithUrl = async () => {
      if (reviewIdFromUrl) {
        if (selectedReview && selectedReview._id === reviewIdFromUrl) return;

        try {
          const existing = reviews.find(r => r._id === reviewIdFromUrl);
          if (existing) {
            setSelectedReview(existing);
          } else {
            const res = await fetch(`${API_BASE_URL}/reviews/${reviewIdFromUrl}`);
            const data = await res.json();
            if (data.success) setSelectedReview(data.data);
          }
        } catch (e) {
          console.error("Deep link fetch error:", e);
        }
      } else if (selectedReview) {
        setSelectedReview(null);
      }
    };
    syncModalWithUrl();
  }, [reviewIdFromUrl, reviews]);

  const openReviewModal = (review) => {
    setSearchParams(prev => {
      prev.set('review', review._id);
      return prev;
    });
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    setSearchParams(prev => {
      prev.delete('review');
      return prev;
    });
    setSelectedReview(null);
  };

  const updateReviewInList = (updatedReview) => {
    setReviews(prev => prev.map(r =>
      r._id === updatedReview._id ? { ...r, ...updatedReview } : r
    ));
    if (selectedReview && selectedReview._id === updatedReview._id) {
      setSelectedReview(prev => ({ ...prev, ...updatedReview }));
    }
  };

  const [sortMode, setSortMode] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  // Sentinel for Infinite Scroll
  const observer = useRef();
  const lastReviewElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // === FETCH SIDEBAR DATA ===
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoadingSidebar(true);
        const [trendingRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/restaurants/trending`).then(r => r.json()),
          fetch(`${API_BASE_URL}/reviews/top-users`).then(r => r.json())
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
    fetchFeed(page, sortMode);
  }, [page, sortMode]);

  const handleSortChange = (mode) => {
    if (mode === sortMode) return;
    setSortMode(mode);
    setPage(1);
    setReviews([]);
    setHasMore(true);
  };

  const fetchFeed = async (pageNum, sort) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`${API_BASE_URL}/reviews/feed?page=${pageNum}&limit=5&sort=${sort}`);
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

  const handleCreatePost = () => {
    // Navigate to restaurant page to write review, or show a modal
    navigate('/search-advanced');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">

          {/* === LEFT COLUMN: FEED === */}
          <div className="w-full lg:w-[65%]">
            
            {/* Stories Section */}
            <StoriesSection 
              topUsers={topUsers}
              currentUser={currentUser}
              onCreateStory={handleCreatePost}
            />

            {/* Feed Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">Bảng tin</h1>
                <div className="flex bg-gray-100 p-1 rounded-full">
                  <button
                    onClick={() => handleSortChange('latest')}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      sortMode === 'latest' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Sparkles size={14} className="inline mr-1" />
                    Mới
                  </button>
                  <button
                    onClick={() => handleSortChange('trending')}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      sortMode === 'trending' 
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Flame size={14} className="inline mr-1" />
                    Hot
                  </button>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                title="Làm mới"
              >
                <RefreshCw size={18} className="text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Feed Content */}
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review._id} ref={index === reviews.length - 1 ? lastReviewElementRef : null}>
                  <FeedReviewCard
                    review={review}
                    onClick={() => openReviewModal(review)}
                    onReviewUpdate={updateReviewInList}
                  />
                </div>
              ))}

              {/* Loading Skeleton */}
              {(loading || loadingMore) && (
                <>
                  <SkeletonFeedReviewCard />
                  <SkeletonFeedReviewCard />
                  {loading && <SkeletonFeedReviewCard />}
                </>
              )}

              {/* End of Feed */}
              {!hasMore && reviews.length > 0 && !loading && (
                <div className="text-center py-10">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-100">
                    <span className="text-2xl">✨</span>
                    <p className="text-green-700 font-medium">Bạn đã xem hết tất cả!</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && reviews.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-500 mb-4">Chưa có bài viết nào.</p>
                  <button 
                    onClick={handleRefresh} 
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: SIDEBAR (Desktop Only) === */}
          <aside className="hidden lg:block w-[35%]">
            <div className="sticky top-24 space-y-5">

              {/* Suggestions For You - Current User */}
              {currentUser && (
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                    </div>
                    <Link to="/profile" className="text-xs font-semibold text-blue-500 hover:text-blue-600">
                      Xem
                    </Link>
                  </div>
                </div>
              )}

              {/* Top Restaurants */}
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-500 text-sm">Đề xuất cho bạn</h3>
                  <Link to="/search-advanced" className="text-xs font-semibold text-gray-900 hover:text-gray-600">
                    Xem tất cả
                  </Link>
                </div>

                <div className="space-y-3">
                  {loadingSidebar ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 w-3/4 rounded" />
                            <div className="h-2 bg-gray-200 w-1/2 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : trending.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4 italic">Chưa có dữ liệu.</p>
                  ) : (
                    trending.slice(0, 5).map((res) => (
                      <Link 
                        to={`/restaurant/${res._id}`} 
                        key={res._id} 
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          <img 
                            src={res.images?.[0] || res.avatar_url || "https://placehold.co/100"} 
                            alt={res.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {res.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{res.address?.split(',')[0]}</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-500 hover:text-blue-700">
                          Xem
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Top Reviewers */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-purple-600" />
                  <h3 className="font-semibold text-purple-900 text-sm">Food Critics</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {loadingSidebar ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-white/50 animate-pulse" />
                    ))
                  ) : topUsers.length === 0 ? (
                    <p className="text-xs text-purple-400 italic w-full text-center py-2">
                      Chưa có reviewer nổi bật.
                    </p>
                  ) : (
                    topUsers.slice(0, 8).map((user, idx) => (
                      <Link
                        to={`/user/${user._id}`}
                        key={user._id}
                        className="relative group"
                        title={`${user.name} (${user.reviewCount} reviews)`}
                      >
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform object-cover"
                          alt={user.name}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                          {user.reviewCount}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-[11px] text-gray-400 space-y-2 px-1">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <Link to="/about" className="hover:underline">Giới thiệu</Link>
                  <span>·</span>
                  <Link to="/privacy" className="hover:underline">Quyền riêng tư</Link>
                  <span>·</span>
                  <Link to="/terms" className="hover:underline">Điều khoản</Link>
                </div>
                <p>© 2024 CHEWZ FROM TDTT</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
        title="Viết đánh giá"
      >
        <Plus size={28} className="text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Review Detail Modal */}
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
