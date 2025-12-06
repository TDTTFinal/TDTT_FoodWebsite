import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";

const RestaurantsPage = () => {
  // ===== STATE MANAGEMENT =====
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ===== DANH SÁCH CATEGORY =====
  const categories = [
    { id: "all", name: "Tất cả", icon: "🍽️", color: "#FF6B6B" },
    { id: "lau", name: "Lẩu", icon: "🍲", color: "#4ECDC4" },
    { id: "bbq", name: "BBQ", icon: "🥩", color: "#FFE66D" },
    { id: "com", name: "Cơm", icon: "🍚", color: "#95E1D3" },
    { id: "pho", name: "Phở", icon: "🍜", color: "#F38181" },
    { id: "bun", name: "Bún", icon: "🥢", color: "#AA96DA" },
    { id: "banh-mi", name: "Bánh mì", icon: "🥖", color: "#FCBAD3" },
    { id: "tra-sua", name: "Trà sữa", icon: "🧋", color: "#A8D8EA" },
    { id: "hai-san", name: "Hải sản", icon: "🦞", color: "#FFA07A" },
    { id: "pizza", name: "Pizza", icon: "🍕", color: "#FFD93D" },
    { id: "chay", name: "Chay", icon: "🥗", color: "#6BCB77" },
  ];

  // ===== FETCH DATA TỪ API =====
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/restaurants?page=1&limit=all"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      let data = [];
      if (result.success && result.data) {
        data = result.data;
      } else if (Array.isArray(result)) {
        data = result;
      }

      const processedData = data.map((restaurant) => ({
        ...restaurant,
        category:
          restaurant.category ||
          detectCategory(restaurant.name, restaurant.menu),
      }));

      setRestaurants(processedData);
      setFilteredRestaurants(processedData);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // ===== HÀM TỰ ĐỘNG PHÁT HIỆN CATEGORY =====
  const detectCategory = (name, menu) => {
    const nameUpper = (name || "").toUpperCase();
    const menuText = menu
      ? menu
          .map((item) => item.name)
          .join(" ")
          .toUpperCase()
      : "";
    const fullText = nameUpper + " " + menuText;

    // Danh sách từ khóa cho mỗi category
    const categoryKeywords = {
      Lẩu: ["LẨU", "HOTPOT", "NƯỚNG LẨU"],
      BBQ: ["BBQ", "NƯỚNG", "THỊT NƯỚNG", "XIÊN", "GÀ NƯỚNG", "BÒ NƯỚNG"],
      Cơm: ["CƠM", "RICE", "CƠM GÀ", "CƠM TẤM", "CƠM SƯỜN"],
      Phở: ["PHỞ", "PHO"],
      Bún: ["BÚN", "BUN", "HỦ TIẾU", "HỦ TÍU"],
      "Bánh mì": ["BÁNH MÌ", "BANH MI"],
      "Trà sữa": ["TRÀ SỮA", "MILK TEA", "CHEESE TEA", "TRÀ", "CAFE", "COFFEE"],
      "Hải sản": ["HẢI SẢN", "SEAFOOD", "TÔM", "CUA", "GHẸ", "ỐC", "NGHÊU"],
      Pizza: ["PIZZA"],
      Chay: ["CHAY", "VEGETARIAN"],
    };

    // Tìm category match
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => fullText.includes(keyword))) {
        return category;
      }
    }

    return "Khác"; // Default category
  };

  // ===== MOCK DATA ĐỂ TEST (khi chưa có API) =====
  const loadMockData = () => {
    const mockRestaurants = [
      {
        _id: "1",
        name: "Út Phương - Cơm Gà Cháy Tỏi 35k",
        address: "577/46 Trần Hưng Đạo, P. Cầu Kho, Quận 1, TP. HCM",
        opening_hours: "08:30 - 17:00",
        price_range: "35k - 55k",
        image_url:
          "https://down-vn.img.susercontent.com/vn-11134513-7ras8-m449utqu1ozz30",
        avg_rating: 5,
        category: "Cơm",
        menu: [
          { name: "Cơm gà nước mắm cháy tỏi", price: 40000 },
          { name: "Mì cay Hàn quốc", price: 55000 },
        ],
      },
      {
        _id: "2",
        name: "Lẩu Thái Hương Xưa - Quận 3",
        address: "123 Võ Văn Tần, Quận 3, TP. HCM",
        opening_hours: "10:00 - 22:00",
        price_range: "150k - 300k",
        image_url: "https://placehold.co/400x300/FF6B6B/white?text=Lau+Thai",
        avg_rating: 4.8,
        category: "Lẩu",
        menu: [],
      },
      {
        _id: "3",
        name: "BBQ Garden - Nướng Hàn Quốc",
        address: "456 Nguyễn Đình Chiểu, Quận 1, TP. HCM",
        opening_hours: "11:00 - 23:00",
        price_range: "250k - 500k",
        image_url: "https://placehold.co/400x300/4ECDC4/white?text=BBQ+Garden",
        avg_rating: 4.9,
        category: "BBQ",
        menu: [],
      },
      {
        _id: "4",
        name: "Phở Lệ - Phở Bò Truyền Thống",
        address: "789 Lý Thường Kiệt, Quận 5, TP. HCM",
        opening_hours: "06:00 - 14:00",
        price_range: "50k - 80k",
        image_url: "https://placehold.co/400x300/FFE66D/white?text=Pho+Le",
        avg_rating: 4.7,
        category: "Phở",
        menu: [],
      },
      {
        _id: "5",
        name: "Gongcha - Trà Sữa Đài Loan",
        address: "234 Nguyễn Trãi, Quận 1, TP. HCM",
        opening_hours: "08:00 - 22:00",
        price_range: "30k - 60k",
        image_url: "https://placehold.co/400x300/A8D8EA/white?text=Gongcha",
        avg_rating: 4.5,
        category: "Trà sữa",
        menu: [],
      },
      {
        _id: "6",
        name: "Nhà Hàng Hải Sản Biển Đông",
        address: "567 Điện Biên Phủ, Quận 3, TP. HCM",
        opening_hours: "10:00 - 22:00",
        price_range: "200k - 600k",
        image_url: "https://placehold.co/400x300/FFA07A/white?text=Hai+San",
        avg_rating: 4.6,
        category: "Hải sản",
        menu: [],
      },
    ];

    setRestaurants(mockRestaurants);
    setFilteredRestaurants(mockRestaurants);
  };

  // ===== FILTER THEO CATEGORY =====
  useEffect(() => {
    let filtered = restaurants;

    // Filter theo category
    if (activeCategory !== "Tất cả") {
      filtered = filtered.filter(
        (restaurant) => restaurant.category === activeCategory
      );
    }

    // Filter theo search term
    if (searchTerm) {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  }, [activeCategory, searchTerm, restaurants]);

  // ===== HANDLE CATEGORY CLICK =====
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // ===== RENDER =====
  return (
    <div>
      <Header />

      {/* ===== BANNER SECTION ===== */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "60px 0",
          color: "#fff",
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              marginBottom: "15px",
            }}
          >
            Khám phá Nhà hàng 🍽️
          </h1>
          <p style={{ fontSize: "18px", opacity: 0.95, marginBottom: "30px" }}>
            Tìm kiếm và trải nghiệm hàng nghìn quán ăn ngon tại TP.HCM
          </p>

          {/* Search bar */}
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm nhà hàng, món ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "18px 25px",
                paddingRight: "60px",
                borderRadius: "50px",
                border: "none",
                fontSize: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                outline: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "25px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* ===== CATEGORY FILTER SECTION ===== */}
      <div
        style={{
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "20px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: "15px",
              overflowX: "auto",
              padding: "10px 0",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "25px",
                  border:
                    activeCategory === cat.name
                      ? `3px solid ${cat.color}`
                      : "2px solid #eee",
                  background: activeCategory === cat.name ? cat.color : "#fff",
                  color: activeCategory === cat.name ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow:
                    activeCategory === cat.name
                      ? "0 4px 12px rgba(0,0,0,0.15)"
                      : "none",
                  transform:
                    activeCategory === cat.name ? "scale(1.05)" : "scale(1)",
                }}
                onMouseOver={(e) => {
                  if (activeCategory !== cat.name) {
                    e.currentTarget.style.background = "#f8f9fa";
                    e.currentTarget.style.transform = "scale(1.03)";
                  }
                }}
                onMouseOut={(e) => {
                  if (activeCategory !== cat.name) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                <span style={{ fontSize: "20px" }}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <main className="container" style={{ padding: "40px 20px" }}>
        {/* Info bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            padding: "15px 20px",
            background: "#f8f9fa",
            borderRadius: "10px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#333",
                marginBottom: "5px",
              }}
            >
              {activeCategory === "Tất cả"
                ? "Tất cả nhà hàng"
                : `Danh mục: ${activeCategory}`}
            </h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Tìm thấy <strong>{filteredRestaurants.length}</strong> kết quả
            </p>
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                padding: "8px 16px",
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              ✕ Xóa tìm kiếm
            </button>
          )}
        </div>

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "6px solid #f3f3f3",
                borderTop: "6px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            ></div>
            <p style={{ fontSize: "18px", color: "#666" }}>
              Đang tải danh sách nhà hàng...
            </p>
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {error && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#fff3cd",
              borderRadius: "10px",
              border: "2px solid #ffc107",
            }}
          >
            <p style={{ fontSize: "24px", marginBottom: "10px" }}>⚠️</p>
            <p
              style={{
                fontSize: "16px",
                color: "#856404",
                marginBottom: "10px",
              }}
            >
              <strong>Không thể tải dữ liệu từ server</strong>
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#856404",
                marginBottom: "20px",
              }}
            >
              {error}
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Hiển thị dữ liệu mẫu để bạn test UI
            </p>
          </div>
        )}

        {/* ===== RESTAURANTS GRID ===== */}
        {!loading && filteredRestaurants.length > 0 && (
          <div
            className="card-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "25px",
              marginTop: "20px",
            }}
          >
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {/* ===== NO RESULTS ===== */}
        {!loading && filteredRestaurants.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: "60px", marginBottom: "20px" }}>🔍</p>
            <h3
              style={{ fontSize: "24px", color: "#333", marginBottom: "10px" }}
            >
              Không tìm thấy kết quả
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác
            </p>
            <button
              onClick={() => {
                setActiveCategory("Tất cả");
                setSearchTerm("");
              }}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Xem tất cả nhà hàng
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Spinning animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .card-grid::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RestaurantsPage;
