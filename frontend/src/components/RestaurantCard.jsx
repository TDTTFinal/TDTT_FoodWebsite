import React from "react";
import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  // ===== EXTRACT DATA =====
  const {
    _id,
    name,
    address,
    opening_hours,
    price_range,
    avatar_url,
    avg_rating,
    category,
    scores,
    menu,
  } = restaurant;

  // ===== FORMAT RATING =====
  const formatRating = (rating) => {
    if (!rating) return "N/A";
    return typeof rating === "number" ? rating.toFixed(1) : rating;
  };

  // ===== GET RATING COLOR =====
  const getRatingColor = (rating) => {
    if (!rating) return "#999";
    if (rating >= 4.5) return "#4CAF50"; // Xanh lá - Xuất sắc
    if (rating >= 4.0) return "#FFC107"; // Vàng - Tốt
    if (rating >= 3.5) return "#FF9800"; // Cam - Khá
    return "#F44336"; // Đỏ - Trung bình
  };

  // ===== GET CATEGORY BADGE COLOR =====
  const getCategoryColor = (cat) => {
    const colors = {
      Lẩu: "#4ECDC4",
      BBQ: "#FFE66D",
      Cơm: "#95E1D3",
      Phở: "#F38181",
      Bún: "#AA96DA",
      "Bánh mì": "#FCBAD3",
      "Trà sữa": "#A8D8EA",
      "Hải sản": "#FFA07A",
      Pizza: "#FFD93D",
      Chay: "#6BCB77",
    };
    return colors[cat] || "#E0E0E0";
  };

  // ===== EXTRACT DISTRICT FROM ADDRESS =====
  const getDistrict = (addr) => {
    if (!addr) return "";
    const match = addr.match(/Quận\s+\d+|Q\.\s*\d+|Quận\s+\w+/i);
    return match ? match[0] : "";
  };

  return (
    <Link
      to={`/restaurant/${_id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="restaurant-card"
        style={{
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        }}
      >
        {/* ===== IMAGE SECTION ===== */}
        <div
          style={{
            position: "relative",
            paddingTop: "66.67%",
            overflow: "hidden",
          }}
        >
          <img
            src={
              avatar_url ||
              "https://placehold.co/400x300/E0E0E0/999?text=No+Image"
            }
            alt={name}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/400x300/E0E0E0/999?text=No+Image";
            }}
          />

          {/* Rating badge */}
          {avg_rating && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: getRatingColor(avg_rating),
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
               {/* <span>⭐</span>  Removed star emoji */}
              {formatRating(avg_rating)}
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: getCategoryColor(category),
                color: "#fff",
                padding: "5px 12px",
                borderRadius: "15px",
                fontSize: "12px",
                fontWeight: "600",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* ===== CONTENT SECTION ===== */}
        <div
          style={{
            padding: "16px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Restaurant name */}
          <h3
            style={{
              fontSize: "17px",
              fontWeight: "700",
              color: "#333",
              marginBottom: "10px",
              lineHeight: "1.3",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "44px",
            }}
          >
            {name}
          </h3>

          {/* Address */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
              marginBottom: "8px",
              color: "#666",
              fontSize: "13px",
            }}
          >
            {/* <span style={{ fontSize: "14px", marginTop: "1px" }}>📍</span> Removed pin emoji */}
            <span
              style={{
                flex: 1,
                lineHeight: "1.4",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {address || "Chưa có địa chỉ"}
            </span>
          </div>

          {/* District highlight */}
          {getDistrict(address) && (
            <div
              style={{
                display: "inline-block",
                background: "#F5F5F5",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#555",
                fontWeight: "600",
                marginBottom: "10px",
                alignSelf: "flex-start",
              }}
            >
              {getDistrict(address)}
            </div>
          )}

          {/* Opening hours */}
          {opening_hours && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
                color: "#666",
                fontSize: "13px",
              }}
            >
              {/* <span>🕐</span> Removed clock emoji */}
              <span>{opening_hours}</span>
            </div>
          )}

          {/* Price range */}
          {price_range && price_range !== "Đang cập nhật" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "12px",
                color: "#E65100",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {/* <span>💰</span> Removed bag emoji */}
              <span>{price_range}</span>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "#E0E0E0",
              margin: "12px 0",
            }}
          ></div>

          {/* Footer info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            {/* Menu items count */}
            {menu && menu.length > 0 && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {/* <span>🍴</span> Removed fork emoji */}
                {menu.length} món
              </div>
            )}

            {/* Scores preview */}
            {scores && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  fontSize: "11px",
                }}
              >
                {Object.entries(scores)
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <span
                      key={key}
                      style={{
                        background: "#F5F5F5",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        color: "#666",
                        fontWeight: "500",
                      }}
                    >
                      {key}: {value}
                    </span>
                  ))}
              </div>
            )}

            {/* View details button */}
            <div
              style={{
                fontSize: "13px",
                color: "#667eea",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginLeft: "auto",
              }}
            >
              Xem chi tiết
              <span style={{ fontSize: "16px" }}>→</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
