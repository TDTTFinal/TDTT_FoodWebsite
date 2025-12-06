import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";

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

  // ===== FETCH DATA TỪ API (backend phân trang + filter) =====
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

  // ===== HANDLE CATEGORY CLICK =====
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    setCurrentPage(1);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // ===== TÍNH RANGE PHÂN TRANG (1 ... 5 6 7 ... 24) =====
  const getPaginationRange = () => {
    const range = [];
    const total = totalPages;
    const current = currentPage;

    if (total <= 7) {
      // Ít trang thì show hết
      for (let i = 1; i <= total; i++) range.push(i);
      return range;
    }

    // luôn có trang 1
    range.push(1);

    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    // Ellipsis bên trái
    if (left > 2) {
      range.push("left-ellipsis");
    }

    // Các trang ở giữa (gần current)
    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    // Ellipsis bên phải
    if (right < total - 1) {
      range.push("right-ellipsis");
    }

    // luôn có trang cuối
    range.push(total);

    return range;
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
              scrollbarWidth: "none",
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
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>
              {activeCategory === "Tất cả"
                ? "Tất cả nhà hàng"
                : `Danh mục: ${activeCategory}`}
            </h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Tìm thấy <strong>{totalResults}</strong> kết quả — Trang{" "}
              <strong>{currentPage}</strong> / {totalPages}
            </p>
          </div>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
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

        {/* ===== LOADING ===== */}
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

        {/* ===== ERROR ===== */}
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
            <p style={{ fontSize: "24px" }}>⚠️</p>
            <p style={{ fontSize: "16px", color: "#856404" }}>
              Không thể tải dữ liệu từ server
            </p>
            <p style={{ fontSize: "14px", color: "#856404" }}>{error}</p>
          </div>
        )}

        {/* ===== RESTAURANTS GRID ===== */}
        {!loading && restaurants.length > 0 && (
          <>
            <div
              className="card-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "25px",
                marginTop: "20px",
              }}
            >
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination */}
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {/* Nút Trước */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: currentPage === 1 ? "#eee" : "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                ⬅ Trước
              </button>

              {/* Các số trang + '...' */}
              {getPaginationRange().map((item, index) => {
                if (typeof item === "string") {
                  return (
                    <span
                      key={item + index}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        color: "#666",
                      }}
                    >
                      ...
                    </span>
                  );
                }

                const page = item;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border:
                        currentPage === page
                          ? "2px solid #667eea"
                          : "1px solid #ddd",
                      background: currentPage === page ? "#667eea" : "#fff",
                      color: currentPage === page ? "#fff" : "#333",
                      cursor: "pointer",
                      minWidth: "36px",
                    }}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Nút Sau */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: currentPage === totalPages ? "#eee" : "#fff",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Sau ➡
              </button>
            </div>
          </>
        )}

        {/* ===== NO RESULTS ===== */}
        {!loading && restaurants.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: "60px" }}>🔍</p>
            <h3 style={{ fontSize: "24px" }}>Không tìm thấy kết quả</h3>
            <button
              onClick={() => {
                setActiveCategory("Tất cả");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "#fff",
                borderRadius: "8px",
              }}
            >
              Xem tất cả nhà hàng
            </button>
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RestaurantsPage;
