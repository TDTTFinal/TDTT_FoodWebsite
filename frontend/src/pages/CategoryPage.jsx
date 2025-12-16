import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Home, Filter, ArrowUpDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';

// CONFIGURATION MAP
const categoryConfig = {
  "com": { 
    name: "Cơm & Món Mặn", 
    gradient: "from-orange-500 to-amber-500", 
    bg: "bg-orange-50",
    text: "text-orange-600",
    desc: "Hương vị cơm nhà, đậm đà bản sắc Việt"
  },
  "nuoc": { 
    name: "Món Nước & Sợi", 
    gradient: "from-yellow-500 to-orange-400", 
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    desc: "Phở, bún, miến, mì - Tinh hoa nước dùng"
  },
  "drinks": { 
    name: "Cafe & Trà Sữa", 
    gradient: "from-emerald-500 to-teal-500", 
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    desc: "Thức uống sảng khoái, nạp năng lượng ngày mới"
  },
  "snack": { 
    name: "Ăn Vặt & Bánh", 
    gradient: "from-pink-500 to-rose-500", 
    bg: "bg-pink-50",
    text: "text-pink-700",
    desc: "Thiên đường ăn vặt và các loại bánh ngọt"
  },
  "party": { 
    name: "Lẩu - Nướng & Nhậu", 
    gradient: "from-red-600 to-rose-600", 
    bg: "bg-red-50",
    text: "text-red-700",
    desc: "Tiệc tùng thả ga, không lo về giá"
  },
  "healthy": { 
    name: "Healthy & Khác", 
    gradient: "from-green-500 to-emerald-400", 
    bg: "bg-green-50",
    text: "text-green-700",
    desc: "Sống khỏe, ăn lành mạnh mỗi ngày"
  },
  "all": { 
    name: "Tất cả", 
    gradient: "from-gray-700 to-gray-900", 
    bg: "bg-gray-50",
    text: "text-gray-700",
    desc: "Khám phá thế giới ẩm thực đa dạng"
  }
};

const CategoryPage = () => {
  const { slug } = useParams();
  const config = categoryConfig[slug] || categoryConfig["all"];
  const categoryName = config.name;
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchRestaurants();
    window.scrollTo(0, 0);
  }, [slug, currentPage]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 24); // Use 24 for better grid multiples (2,3,4)
      params.append("category", categoryName);

      const response = await fetch(
        `http://localhost:5000/api/restaurants?${params.toString()}`
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      
      const result = await response.json();
      
      if (result.success) {
        setRestaurants(result.data);
        setTotalPages(result.totalPages || 1);
        setTotalResults(result.total || 0);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách nhà hàng.");
    } finally {
      setLoading(false);
    }
  };

  // Sort logic (Client-side for now, can be server-side)
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    if (sortOption === "rating_desc") return b.avg_rating - a.avg_rating;
    if (sortOption === "name_asc") return a.name.localeCompare(b.name);
    return 0; // Default order from DB
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      {/* HERO BANNER */}
      <div className={`relative bg-gradient-to-r ${config.gradient} py-16 md:py-20 text-white overflow-hidden shadow-lg`}>
         {/* Decorative Blobs */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

         <div className="container mx-auto px-4 relative z-10 text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/80 mb-4 font-medium">
               <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                 <Home size={14} /> Trang chủ
               </Link>
               <ChevronRight size={14} />
               <span>Danh mục</span>
               <ChevronRight size={14} />
               <span className="text-white underline decoration-white/30 underline-offset-4">{categoryName}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-3 text-shadow-sm tracking-tight">
               {categoryName}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
               {config.desc}
            </p>
         </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-grow -mt-8 relative z-20">
        
        {/* TOOLBAR */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-gray-600 font-medium">
              Tìm thấy <strong className="text-gray-900">{totalResults}</strong> địa điểm
           </div>

           <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-700">
                 <Filter size={16} />
                 <span>Lọc: Mặc định</span>
              </div>
              <div className="relative group">
                 <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-gray-100 pl-9 pr-8 py-2 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                 >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="rating_desc">Đánh giá cao nhất</option>
                    <option value="name_asc">Tên (A-Z)</option>
                 </select>
                 <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
           </div>
        </div>
        
        {loading && (
           <div className="flex flex-col items-center justify-center py-24">
             <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-medium">Đang tải dữ liệu ngon lành...</p>
           </div>
        )}

        {error && (
          <div className="text-center bg-red-50 text-red-600 py-10 rounded-xl border border-red-100">
             <h3 className="font-bold text-lg">Có lỗi xảy ra</h3>
             <p>{error}</p>
          </div>
        )}

        {/* GRID RESULTS */}
        {!loading && !error && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedRestaurants.map((res) => (
                        <RestaurantCard key={res._id} restaurant={res} />
                    ))}
                </div>

                {sortedRestaurants.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có quán nào</h3>
                        <p className="text-gray-500">Danh mục này hiện đang được cập nhật thêm.</p>
                        <Link to="/" className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors">
                           Quay lại trang chủ
                        </Link>
                    </div>
                )}
            </>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pb-8">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={20} className="rotate-180" />
                </button>
                
                <span className="px-4 py-2 font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg shadow-sm">
                    Trang {currentPage} / {totalPages}
                </span>

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;