import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { Search, ChevronLeft, ChevronRight, X, Utensils, Coffee, Pizza, Cherry, Beef, Soup, Fish, Beer, Leaf } from "lucide-react";

const RestaurantsPage = () => {
  // ===== STATE MANAGEMENT =====
  const [restaurants, setRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // ===== DANH SÁCH CATEGORY (matching HomePage style) =====
  const categories = [
    { id: "all", name: "Tất cả", icon: <Utensils size={20}/>, color: "bg-gray-100 text-gray-600" },
    { id: "com", name: "Cơm & Món Mặn", icon: <Utensils size={20}/>, color: "bg-orange-100 text-orange-600" },
    { id: "nuoc", name: "Món Nước & Sợi", icon: <Soup size={20}/>, color: "bg-yellow-100 text-yellow-600" },
    { id: "drinks", name: "Cafe & Trà Sữa", icon: <Coffee size={20}/>, color: "bg-green-100 text-green-600" },
    { id: "snack", name: "Ăn Vặt & Bánh", icon: <Pizza size={20}/>, color: "bg-pink-100 text-pink-600" },
    { id: "party", name: "Lẩu - Nướng & Nhậu", icon: <Beer size={20}/>, color: "bg-red-100 text-red-600" },
    { id: "healthy", name: "Healthy & Khác", icon: <Leaf size={20}/>, color: "bg-emerald-100 text-emerald-600" },
  ];

  // ===== FETCH DATA TỪ API =====
  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, activeCategory, searchTerm]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 50);

      if (activeCategory !== "Tất cả")
        params.append("category", activeCategory);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const response = await fetch(
        `http://localhost:5000/api/restaurants?${params.toString()}`
      );

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const result = await response.json();

      let data = [];
      if (result.success && result.data) {
        data = result.data;
        setTotalPages(result.totalPages || 1);
        setTotalResults(result.total || data.length);
      }

      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    setCurrentPage(1);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const getPaginationRange = () => {
    const range = [];
    const total = totalPages;
    const current = currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i);
      return range;
    }

    range.push(1);
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    if (left > 2) range.push("left-ellipsis");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push("right-ellipsis");
    range.push(total);

    return range;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ===== HERO BANNER ===== */}
      <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 py-16 md:py-24 overflow-hidden">
        {/* Decorative Circles - subtle pattern */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            Khám phá Nhà hàng
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Tìm kiếm và trải nghiệm hàng nghìn quán ăn ngon tại TP.HCM
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm nhà hàng, món ăn..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-4 px-6 pr-14 rounded-full border-none text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-300/50 transition-all"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Search size={24} className="text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CATEGORY FILTER ===== */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 md:justify-between items-start py-4 overflow-x-auto scrollbar-hide w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center gap-2 group min-w-[100px] p-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${
                  activeCategory === cat.name 
                    ? `${cat.color} ring-2 ring-offset-2 ring-orange-500 shadow-md scale-105` 
                    : `${cat.color} opacity-90 group-hover:opacity-100`
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-xs font-medium text-center w-full px-1 ${
                  activeCategory === cat.name ? "text-orange-600 font-bold" : "text-gray-700"
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="container mx-auto px-4 py-8">
        {/* Info bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Utensils size={20} className="text-orange-500" />
              {activeCategory === "Tất cả"
                ? "Tất cả nhà hàng"
                : `Danh mục: ${activeCategory}`}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tìm thấy <strong className="text-orange-600">{totalResults}</strong> kết quả 
              <span className="mx-2">•</span>
              Trang <strong>{currentPage}</strong> / {totalPages}
            </p>
          </div>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <X size={16} />
              Xóa tìm kiếm "{searchTerm}"
            </button>
          )}
        </div>

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6"></div>
            <p className="text-lg text-gray-600 font-medium">
              Đang tải danh sách nhà hàng...
            </p>
          </div>
        )}

        {/* ===== ERROR ===== */}
        {error && !loading && (
          <div className="text-center py-16 px-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-amber-800 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-amber-700">{error}</p>
            <button 
              onClick={fetchRestaurants}
              className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* ===== RESTAURANTS GRID ===== */}
        {!loading && restaurants.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                }`}
              >
                <ChevronLeft size={18} />
                Trước
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPaginationRange().map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <span key={item + index} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
                        currentPage === item
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                }`}
              >
                Sau
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ===== NO RESULTS ===== */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy kết quả</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc xem tất cả nhà hàng
            </p>
            <button
              onClick={() => {
                setActiveCategory("Tất cả");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
            >
              <Utensils size={20} />
              Xem tất cả nhà hàng
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantsPage;
