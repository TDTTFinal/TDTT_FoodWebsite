import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import CategorySection from "../components/home/CategorySection";
import NearMeSection from "../components/home/NearMeSection";
import CommunityReviews from "../components/home/CommunityReviews";
import FeatureRankSection from "../components/home/FeatureRankSection";
import ContextAwareSection from "../components/home/ContextAwareSection";
import CollectionBanner from "../components/home/CollectionBanner";
import RestaurantCard from "../components/RestaurantCard";
import SkeletonCard from "../components/SkeletonCard";
import api from "../config/api";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slogan, setSlogan] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // KHO TÀNG CA DAO / SLOGAN
  const funnyQuotes = [
    "Độc lập tự do, ăn no rồi ngủ. 😴",
    "Yêu là phải nói, cũng như đói là phải ăn. 💘",
    "Giảm cân là chuyện ngày mai, hôm nay cứ lai rai đã. 🍗",
    "Tiền là phù du, bò Wagyu là vĩnh cửu. 🥩",
  ];

  useEffect(() => {
    setSlogan(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]);
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get("/featured?limit=8");
      if (res.success) {
        setFeatured(res.data);
      }
    } catch (err) {
      console.error("Fetch featured error:", err);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search-advanced?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* BANNER SECTION */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white py-12 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Chào {user?.name || "bạn"}, hôm nay "măm" gì? 👋
          </h1>
          <p className="text-lg md:text-xl font-medium italic opacity-90 mb-8 bg-white/20 inline-block px-6 py-2 rounded-full backdrop-blur-sm border border-white/30">
            "{slogan}"
          </p>
          
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm món ngon, địa điểm..."
              className="w-full h-14 pl-6 pr-14 rounded-full text-gray-800 shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all font-medium"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 h-10 w-10 bg-orange-600 rounded-full flex items-center justify-center text-white hover:bg-orange-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <main className="flex-1 pb-12">


        {/* SECTION 1.5: CATEGORIES */}
        <CategorySection />

        {/* SECTION 2: NEAR ME */}
        <NearMeSection />

        {/* SECTION 2.5: COMMUNITY REVIEWS (NEW) */}
        <CommunityReviews />

        {/* SECTION 2.6: BEST SPACE (NEW) */}
        <FeatureRankSection type="space" />

        {/* SECTION 3: COLLECTIONS */}
        <CollectionBanner />

         {/* SECTION 3.5: BUDGET (NEW) */}
         <FeatureRankSection type="cheap" />
        
        {/* SECTION 4: CONTEXT AWARE */}
        <ContextAwareSection />

        {/* SECTION 5: FEATURED / FEED */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-orange-500">🔥</span> Nổi bật nhất
            </h2>
            <button className="text-orange-600 font-medium hover:underline text-sm">Xem tất cả</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingFeatured
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featured.map((res) => (
                  <RestaurantCard key={res._id} restaurant={res} />
                ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
