// FIXED VERSION - Sửa bug filter quận có tên nhiều từ
// Thay đổi chính: extractDistrict() và logic so sánh district

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { searchAPI } from "/services/api";

const ITEMS_PER_PAGE = 12;

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search States
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Geolocation States
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Filter States
  const [filters, setFilters] = useState({
    category: "Tất cả",
    priceRange: "Tất cả",
    minRating: 0,
    district: "Tất cả",
    sortBy: "hybrid", // hybrid, semantic, tfidf, rating, distance, name
    maxDistance: null, // km - for "Quán gần tôi"
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Categories
  const categories = [
    "Tất cả",
    "Lẩu",
    "BBQ",
    "Cơm",
    "Phở",
    "Bún",
    "Trà sữa",
    "Cafe",
    "Hải sản",
    "Buffet",
    "Khác",
  ];

  const priceRanges = [
    "Tất cả",
    "Dưới 50k",
    "50k - 100k",
    "100k - 200k",
    "200k - 500k",
    "Trên 500k",
  ];

  const districts = [
    "Tất cả",
    "Quận 1",
    "Quận 2",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 9",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Bình Thạnh",
    "Gò Vấp",
    "Tân Bình",
    "Phú Nhuận",
    "Thủ Đức",
    "Bình Tân",
    "Tân Phú",
  ];

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Calculate Haversine distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Extract price from price_range string
  const extractPrice = (priceRange) => {
    if (!priceRange || priceRange === "Đang cập nhật") return null;
    const match = priceRange.match(/(\d+)k?/i);
    return match ? parseInt(match[1]) * 1000 : null;
  };

  // Check if restaurant matches price range filter
  const matchesPriceRange = (restaurant, range) => {
    if (range === "Tất cả") return true;

    const price = extractPrice(restaurant.price_range);
    if (!price) return false;

    switch (range) {
      case "Dưới 50k":
        return price < 50000;
      case "50k - 100k":
        return price >= 50000 && price <= 100000;
      case "100k - 200k":
        return price >= 100000 && price <= 200000;
      case "200k - 500k":
        return price >= 200000 && price <= 500000;
      case "Trên 500k":
        return price > 500000;
      default:
        return true;
    }
  };

  // ⭐ FIXED: Extract district from address - hỗ trợ quận nhiều từ
  const extractDistrict = (address) => {
    if (!address) return "";

    // Normalize address: Q. -> Quận
    const normalizedAddress = address
      .replace(/Q\.\s*/gi, "Quận ")
      .replace(/P\.\s*/gi, "Phường ")
      .trim();

    // Try matching numbered districts first (Quận 1-12)
    let match = normalizedAddress.match(/Quận\s+(\d+)/i);
    if (match) {
      return `Quận ${match[1]}`;
    }

    // Try matching named districts (multi-word)
    // Look for district name until comma or other delimiter
    match = normalizedAddress.match(
      /Quận\s+([\p{L}\s]+?)(?=,|\s*-|\s+P\b|\s+Phường|$)/iu
    );
    if (match) {
      let districtName = match[1].trim();

      // Remove trailing junk
      districtName = districtName.replace(/\s+/g, " ");

      // Only return if it's a reasonable length (1-3 words)
      const wordCount = districtName.split(" ").length;
      if (wordCount >= 1 && wordCount <= 3) {
        return districtName;
      }
    }

    return "";
  };

  // ⭐ FIXED: Check if district matches - hỗ trợ so sánh linh hoạt
  const matchesDistrict = (address, filterDistrict) => {
    if (filterDistrict === "Tất cả") return true;

    const extracted = extractDistrict(address);
    if (!extracted) return false;

    // Exact match (Quận 4 === Quận 4)
    if (extracted === filterDistrict) return true;

    // Check if filter is "Quận X" and extracted is just "X"
    if (filterDistrict.startsWith("Quận ")) {
      return (
        extracted === filterDistrict || `Quận ${extracted}` === filterDistrict
      );
    }

    // Check if extracted is "Quận X" and filter is just "X"
    if (extracted.startsWith("Quận ")) {
      return (
        extracted === filterDistrict || extracted === `Quận ${filterDistrict}`
      );
    }

    // For named districts: case-insensitive partial match
    // This handles cases where database has "Bình Thạnh" and filter has "Bình Thạnh"
    const normalizedExtracted = extracted.toLowerCase().trim();
    const normalizedFilter = filterDistrict.toLowerCase().trim();

    return (
      normalizedExtracted === normalizedFilter ||
      normalizedExtracted.includes(normalizedFilter) ||
      normalizedFilter.includes(normalizedExtracted)
    );
  };

  // Calculate hybrid score (weighted combination)
  const calculateHybridScore = (restaurant) => {
    const semantic = restaurant.semantic_score || 0;
    const tfidf = restaurant.tfidf_score || 0;

    // Weighted combination: 60% semantic + 40% TF-IDF
    // Cân bằng giữa ý nghĩa ngữ nghĩa và keyword matching
    return semantic * 0.6 + tfidf * 0.4;
  };

  // ==========================================
  // GEOLOCATION
  // ==========================================

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationLoading(false);

        // Auto-apply distance filter
        setFilters((prev) => ({
          ...prev,
          maxDistance: 5, // Default 5km
          sortBy: "distance",
        }));
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Bạn cần cho phép truy cập vị trí");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Không thể xác định vị trí");
            break;
          case error.TIMEOUT:
            setLocationError("Timeout xác định vị trí");
            break;
          default:
            setLocationError("Lỗi xác định vị trí");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache 5 minutes
      }
    );
  };

  // ==========================================
  // FILTERING & SORTING
  // ==========================================

  const applyFilters = (
    restaurantList,
    customFilters = filters,
    customLocation = userLocation
  ) => {
    let filtered = [...restaurantList];

    const f = customFilters;
    const loc = customLocation;

    // Add distance data if user location available
    if (loc) {
      filtered = filtered.map((r) => ({
        ...r,
        distance:
          r.lat && r.lon
            ? calculateDistance(loc.lat, loc.lon, r.lat, r.lon)
            : null,
      }));
    }

    // Filter by category
    if (f.category !== "Tất cả") {
      filtered = filtered.filter((r) => r.category === f.category);
    }

    // Filter by price range
    if (f.priceRange !== "Tất cả") {
      filtered = filtered.filter((r) => matchesPriceRange(r, f.priceRange));
    }

    // Filter by minimum rating
    if (f.minRating > 0) {
      filtered = filtered.filter((r) => r.avg_rating >= f.minRating);
    }

    // ⭐ FIXED: Filter by district - dùng hàm matchesDistrict mới
    if (f.district !== "Tất cả") {
      filtered = filtered.filter((r) => matchesDistrict(r.address, f.district));
    }

    // Filter by max distance (if location available)
    if (f.maxDistance && loc) {
      filtered = filtered.filter(
        (r) => r.distance !== null && r.distance <= f.maxDistance
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (f.sortBy) {
        case "hybrid":
          return calculateHybridScore(b) - calculateHybridScore(a);

        case "semantic":
          return (b.semantic_score || 0) - (a.semantic_score || 0);

        case "tfidf":
          return (b.tfidf_score || 0) - (a.tfidf_score || 0);

        case "rating":
          return b.avg_rating - a.avg_rating;

        case "distance":
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;

        case "name":
          return a.name.localeCompare(b.name, "vi");

        default:
          return 0;
      }
    });

    return filtered;
  };

  // ==========================================
  // SEARCH HANDLER
  // ==========================================

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const response = await searchAPI.advanced({ q: trimmedKeyword });

      if (response.success && Array.isArray(response.data)) {
        setRestaurants(response.data);
        const filtered = applyFilters(response.data);
        setFilteredRestaurants(filtered);

        // Update URL
        setSearchParams({ q: trimmedKeyword });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại."
      );
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    // Re-apply filters
    const filtered = applyFilters(restaurants, newFilters, userLocation);
    setFilteredRestaurants(filtered);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: "Tất cả",
      priceRange: "Tất cả",
      minRating: 0,
      district: "Tất cả",
      sortBy: "hybrid",
      maxDistance: null,
    };
    setFilters(resetFilters);
    setCurrentPage(1);

    const filtered = applyFilters(restaurants, resetFilters, userLocation);
    setFilteredRestaurants(filtered);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam && queryParam !== keyword) {
      setKeyword(queryParam);
      handleSearch();
    }
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      const filtered = applyFilters(restaurants, filters, userLocation);
      setFilteredRestaurants(filtered);
    }
  }, [userLocation]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          padding: "40px 20px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "36px" }}>🔍</span> Tìm kiếm thông minh
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "24px",
            }}
          >
            Hơn 1,200 nhà hàng với thuật toán Hybrid Ranking (Semantic + TF-IDF)
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder='Ví dụ: "phở bò", "lẩu hải sản", "quán ăn vặt"...'
              style={{
                flex: 1,
                padding: "16px 20px",
                fontSize: "16px",
                border: "2px solid #E0E0E0",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#E65100")}
              onBlur={(e) => (e.target.style.borderColor = "#E0E0E0")}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "16px 32px",
                background: loading ? "#BDBDBD" : "#E65100",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loading ? "⏳" : "🔍"} Tìm kiếm
            </button>
            <button
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              style={{
                padding: "16px 24px",
                background: locationLoading
                  ? "#BDBDBD"
                  : userLocation
                  ? "#2196F3"
                  : "#fff",
                color: userLocation ? "#fff" : "#333",
                border: userLocation ? "none" : "2px solid #E0E0E0",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: locationLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {locationLoading ? "⏳" : userLocation ? "✓" : "📍"} Quán gần tôi
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 16px",
                background: "#FFEBEE",
                border: "1px solid #FFCDD2",
                borderRadius: "8px",
                color: "#C62828",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {locationError && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 16px",
                background: "#FFF3E0",
                border: "1px solid #FFE0B2",
                borderRadius: "8px",
                color: "#E65100",
                fontSize: "14px",
              }}
            >
              ⚠️ {locationError}
            </div>
          )}
        </div>

        {/* Results Section */}
        {hasSearched && !loading && (
          <div style={{ display: "flex", gap: "24px" }}>
            {/* Filters Sidebar */}
            <div
              style={{
                width: "300px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  padding: "24px",
                  position: "sticky",
                  top: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#333",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>🎯</span> Bộ lọc
                  </h3>
                  <button
                    onClick={handleResetFilters}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#E65100",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Đặt lại
                  </button>
                </div>

                {/* Sắp xếp theo */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    🎨 Sắp xếp theo
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    <option value="hybrid">Hybrid Score (Đề xuất)</option>
                    <option value="semantic">Semantic Score</option>
                    <option value="tfidf">TF-IDF Score</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="distance">Khoảng cách gần</option>
                    <option value="name">Tên A-Z</option>
                  </select>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      marginTop: "6px",
                      lineHeight: "1.4",
                    }}
                  >
                    60% Semantic + 40% TF-IDF
                  </p>
                </div>

                {/* Loại món */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    🍜 Loại món
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mức giá */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    💰 Mức giá
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      handleFilterChange("priceRange", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Đánh giá tối thiểu */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    ⭐ Đánh giá tối thiểu (0-10)
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[0, 5, 7, 8, 9].map((rating) => (
                      <label
                        key={rating}
                        style={{
                          flex: 1,
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="radio"
                          name="minRating"
                          value={rating}
                          checked={filters.minRating === rating}
                          onChange={(e) =>
                            handleFilterChange(
                              "minRating",
                              parseInt(e.target.value)
                            )
                          }
                          style={{ display: "none" }}
                        />
                        <div
                          style={{
                            padding: "8px 4px",
                            background:
                              filters.minRating === rating
                                ? "#E65100"
                                : "#F5F5F5",
                            color:
                              filters.minRating === rating ? "#fff" : "#666",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {rating === 0 ? "Tất cả" : `${rating}+`}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quận/Huyện */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "8px",
                    }}
                  >
                    📍 Quận/Huyện
                  </label>
                  <select
                    value={filters.district}
                    onChange={(e) =>
                      handleFilterChange("district", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "14px",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  Kết quả tìm kiếm
                </h2>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  Tìm thấy{" "}
                  <strong style={{ color: "#E65100" }}>
                    {filteredRestaurants.length}
                  </strong>{" "}
                  nhà hàng{" "}
                  {filters.district !== "Tất cả" && `tại ${filters.district}`}
                </p>
              </div>

              {currentRestaurants.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {currentRestaurants.map((restaurant) => (
                    <div
                      key={restaurant._id}
                      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                      style={{
                        cursor: "pointer",
                        position: "relative",
                        background: "#fff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 12px rgba(0,0,0,0.08)";
                      }}
                    >
                      <RestaurantCard restaurant={restaurant} />

                      {/* Distance Badge */}
                      {userLocation && restaurant.distance !== null && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "16px",
                            right: "16px",
                            background: "rgba(33,150,243,0.95)",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            zIndex: 10,
                          }}
                        >
                          📍 {restaurant.distance.toFixed(1)} km
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "#fff",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    😔
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: "8px",
                    }}
                  >
                    Không tìm thấy kết quả
                  </h3>
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    padding: "20px 0",
                  }}
                >
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{
                      padding: "10px 16px",
                      background: currentPage === 1 ? "#F5F5F5" : "#fff",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: currentPage === 1 ? "#999" : "#333",
                      transition: "all 0.2s",
                    }}
                  >
                    ← Trước
                  </button>

                  {getPageNumbers().map((p, index) =>
                    p === "..." ? (
                      <span
                        key={`dots-${index}`}
                        style={{ padding: "0 8px", color: "#999" }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        style={{
                          padding: "10px 16px",
                          background: p === currentPage ? "#E65100" : "#fff",
                          border: "2px solid",
                          borderColor:
                            p === currentPage ? "#E65100" : "#E0E0E0",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: p === currentPage ? "#fff" : "#333",
                          minWidth: "44px",
                          transition: "all 0.2s",
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{
                      padding: "10px 16px",
                      background:
                        currentPage === totalPages ? "#F5F5F5" : "#fff",
                      border: "2px solid #E0E0E0",
                      borderRadius: "8px",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: currentPage === totalPages ? "#999" : "#333",
                      transition: "all 0.2s",
                    }}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no search performed */}
        {!hasSearched && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎯</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#333",
                marginBottom: "12px",
              }}
            >
              Tìm kiếm thông minh với AI
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "15px",
                maxWidth: "600px",
                margin: "0 auto 20px",
              }}
            >
              Sử dụng thuật toán Hybrid Ranking (Semantic Search + TF-IDF) để
              tìm nhà hàng phù hợp nhất với bạn
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                marginTop: "24px",
                fontSize: "14px",
                color: "#999",
              }}
            >
              <span>🧠 Semantic Score</span>
              <span>📊 TF-IDF Score</span>
              <span>📍 Geolocation</span>
              <span>⭐ Rating</span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdvancedSearchPage;
