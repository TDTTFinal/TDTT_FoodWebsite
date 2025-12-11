// FIXED VERSION - Sửa bug filter quận có tên nhiều từ
// Thay đổi chính: extractDistrict() và logic so sánh district

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { searchAPI } from "/services/api";

const ITEMS_PER_PAGE = 15;

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
    "Dưới 50.000",
    "50.000 - 100.000",
    "100.000 - 200.000",
    "200.000 - 500.000",
    "Trên 500.000",
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

  // ⭐ FIXED: Parse price range string to {min, max} object
  const parsePriceRange = (rangeStr) => {
    if (!rangeStr || typeof rangeStr !== 'string') return null;

    // Normalization:
    // 1. Lowercase
    // 2. Remove dots, commas (thousands separators)
    // 3. Remove 'đ', 'vnd', 'k' (unless k is multiplier? logic below assumes full numbers usually)
    //    Actually, user inputs might be "50k", DB might be "50.000".
    //    Let's strip dots/commas first.
    let cleanStr = rangeStr.toLowerCase().replace(/\./g, "").replace(/,/g, "");

    // Remove currency symbols/words
    cleanStr = cleanStr.replace(/đ|vnd|vnđ/g, "").trim();

    // Check for "đang cập nhật"
    if (cleanStr.includes("cập nhật")) return null;

    console.log(`[PriceParse] Parsing: "${rangeStr}" -> "${cleanStr}"`);

    // Case 1: "30000 - 50000" (using hyphen, en-dash, em-dash)
    // Regex: (\d+) \s* [ - – — ] \s* (\d+)
    const rangeMatch = cleanStr.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      console.log(`[PriceParse] Range Detected: ${min} - ${max}`);
      return { min, max };
    }

    // Case 2: "Dưới 50000", "< 50000", "Under 50000"
    const underMatch = cleanStr.match(/(dưới|<|under|khoảng)\s*(\d+)/);
    if (underMatch) {
      const val = parseInt(underMatch[2]);
      // If "khoảng", treating as point value or small range?
      // Let's treat "dưới" as 0 to val
      if (underMatch[1] === 'khoảng') {
         return { min: val, max: val };
      }
      return { min: 0, max: val };
    }

    // Case 3: "Trên 200000", "> 200000", "Over 200000"
    const overMatch = cleanStr.match(/(trên|>|over)\s*(\d+)/);
    if (overMatch) {
      return { min: parseInt(overMatch[2]), max: Infinity };
    }

    // Case 4: Single number "20000"
    const numberMatch = cleanStr.match(/(\d+)/);
    if (numberMatch) {
      const val = parseInt(numberMatch[1]);
       // If just a number, maybe it's a fixed price?
       console.log(`[PriceParse] Single value: ${val}`);
       return { min: val, max: val };
    }

    return null;
  };

  // Check if restaurant matches price range filter
  const matchesPriceRange = (restaurant, filterRange) => {
    if (filterRange === "Tất cả") return true;

    // Log the restaurant being checked (optional, mostly for debugging specific ones)
    // console.log("Checking price for:", restaurant.name, restaurant.price_range);

    const priceData = parsePriceRange(restaurant.price_range);
    
    // STRICT RULE: If price is unknown or updating, DO NOT show when a specific filter is applied.
    // Logic: User wants "Cheap", we don't know if "Updating" is cheap.
    if (!priceData) return false; 

    const { min: rMin, max: rMax } = priceData;

    switch (filterRange) {
      case "Dưới 50.000": 
        return rMin < 50000;

      case "50.000 - 100.000":
        return rMin < 100000 && rMax > 50000;

      case "100.000 - 200.000": 
        return rMin < 200000 && rMax > 100000;

      case "200.000 - 500.000": 
        return rMin < 500000 && rMax > 200000;

      case "Trên 500.000": 
        return rMax > 500000;

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
            borderRadius: "24px", // Increased radius for modern look
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)", // Softer, deeper shadow
            padding: "40px",
            marginBottom: "40px",
            display: "flex", // Center content
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#333",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textAlign: "center",
            }}
          >
            Tìm kiếm thông minh
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#666",
              marginBottom: "32px",
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            Hơn 1,200 nhà hàng với thuật toán Hybrid Ranking (Semantic + TF-IDF)
          </p>

          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
              maxWidth: "800px",
              flexWrap: "wrap", // Allow wrapping on small screens
            }}
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder='Ví dụ: "phở bò", "lẩu hải sản", "quán ăn vặt"...'
              style={{
                flex: "1 1 300px", // Grow, shrink, base width
                padding: "18px 24px",
                fontSize: "16px",
                border: "2px solid #E0E0E0",
                borderRadius: "16px",
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#E65100";
                e.target.style.boxShadow = "0 4px 12px rgba(230, 81, 0, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0E0E0";
                e.target.style.boxShadow = "none";
              }}
            />
            <div style={{ display: "flex", gap: "12px", flex: "0 1 auto" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "18px 32px",
                  background: loading ? "#BDBDBD" : "#E65100",
                  color: "#fff",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "transform 0.1s ease, box-shadow 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(230, 81, 0, 0.2)",
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
              >
                {loading ? "Loading..." : "Tìm kiếm"}
              </button>
              <button
                type="button"
                onClick={getUserLocation}
                disabled={locationLoading}
                style={{
                  padding: "18px 24px",
                  background: locationLoading
                    ? "#BDBDBD"
                    : userLocation
                    ? "#2196F3"
                    : "#fff",
                  color: userLocation ? "#fff" : "#333",
                  border: userLocation ? "none" : "2px solid #E0E0E0",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: locationLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {locationLoading ? "Loading..." : userLocation ? "Đã xác định" : "Quán gần tôi"}
              </button>
            </div>
          </form>

          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                background: "#FFEBEE",
                border: "1px solid #FFCDD2",
                borderRadius: "12px",
                color: "#C62828",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {error}
            </div>
          )}

          {locationError && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 20px",
                background: "#FFF3E0",
                border: "1px solid #FFE0B2",
                borderRadius: "12px",
                color: "#E65100",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {locationError}
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
                  borderRadius: "20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  padding: "32px",
                  position: "sticky",
                  top: "24px",
                  border: "1px solid #F0F0F0",
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
                    Bộ lọc
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
                      "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: "16px",
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
              padding: "100px 24px",
              background: "#fff",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <div style={{ fontSize: "80px", marginBottom: "24px", animation: "bounce 2s infinite" }}>🎯</div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#333",
                marginBottom: "16px",
              }}
            >
              Tìm kiếm thông minh với AI
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "16px",
                maxWidth: "600px",
                margin: "0 auto 32px",
                lineHeight: "1.6",
              }}
            >
              Sử dụng thuật toán Hybrid Ranking (Semantic Search + TF-IDF) để
              tìm nhà hàng phù hợp nhất với bạn
            </p>
            <div
              style={{
                display: "flex",
                gap: "24px",
                justifyContent: "center",
                flexWrap: "wrap",
                fontSize: "14px",
                color: "#888",
                fontWeight: "500",
              }}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F5F5', padding: '8px 16px', borderRadius: '20px'}}>
                🧠 Semantic Score
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F5F5', padding: '8px 16px', borderRadius: '20px'}}>
                📊 TF-IDF Score
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F5F5', padding: '8px 16px', borderRadius: '20px'}}>
                📍 Geolocation
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F5F5', padding: '8px 16px', borderRadius: '20px'}}>
                ⭐ Rating
              </span>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdvancedSearchPage;
