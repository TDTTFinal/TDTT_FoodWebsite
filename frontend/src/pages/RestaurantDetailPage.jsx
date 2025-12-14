import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../config/api";

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRestaurantDetail();
  }, [id]);

  // 🆕 THÊM: Hàm gọi API lấy chi tiết nhà hàng
  const fetchRestaurantDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.get(`/restaurants/${id}`);

      // Parse response từ backend: { success: true, data: {...} }
      if (result.success && result.data) {
        // Map dữ liệu từ API sang format hiển thị
        const data = result.data;
        setRestaurant({
          id: data._id,
          name: data.name,
          address: data.address || "Chưa cập nhật địa chỉ",
          rating: data.avg_rating || 0,
          reviews_count: data.reviews?.length || 0,
          open_time: data.opening_hours || "Đang cập nhật",
          price_range: data.price_range || "Đang cập nhật",
          img:
            data.avatar_url ||
            "https://placehold.co/800x400/FFF3E0/E65100?text=Restaurant",
          description:
            data.reviews?.[0]?.comment ||
            "Nhà hàng với nhiều món ăn ngon, không gian thoáng mát...",
          category: data.category || "Khác",
          scores: data.scores || {},
          menu:
            data.menu?.length > 0
              ? data.menu.map((item) => ({
                  name: item.name,
                  price: formatPrice(item.price),
                  img: getMenuEmoji(item.name),
                }))
              : [
                  { name: "Món đặc biệt 1", price: "Liên hệ", img: "🍽️" },
                  { name: "Món đặc biệt 2", price: "Liên hệ", img: "🥘" },
                ],
          reviews:
            data.reviews?.slice(0, 5).map((review) => ({
              user: review.user || "Khách hàng",
              rating: review.rating || 5,
              content: review.comment || "Đánh giá tốt",
              date: formatDate(review.date),
            })) || [],
        });
      } else {
        throw new Error("Không tìm thấy nhà hàng");
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError(err.message || "Không thể tải thông tin nhà hàng");
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format giá tiền
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    if (typeof price === "number") {
      return price >= 1000 ? `${(price / 1000).toFixed(0)}k` : `${price}đ`;
    }
    return price;
  };

  // Helper: Format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  // Helper: Lấy emoji cho menu
  const getMenuEmoji = (name) => {
    const nameLower = (name || "").toLowerCase();
    if (
      nameLower.includes("phở") ||
      nameLower.includes("mì") ||
      nameLower.includes("bún")
    )
      return "🍜";
    if (nameLower.includes("cơm")) return "🍚";
    if (nameLower.includes("gà")) return "🍗";
    if (nameLower.includes("bò") || nameLower.includes("thịt")) return "🥩";
    if (
      nameLower.includes("tôm") ||
      nameLower.includes("cua") ||
      nameLower.includes("hải sản")
    )
      return "🦐";
    if (nameLower.includes("lẩu")) return "🍲";
    if (nameLower.includes("trà") || nameLower.includes("nước")) return "🧋";
    if (nameLower.includes("bánh")) return "🥮";
    return "🍽️";
  };

  // Fallback mock data
  const loadMockData = () => {
    setRestaurant({
      id: id,
      name: "Hải sản Trần Long",
      address: "Số 888, Bến Nghé, Quận 1, TP.HCM",
      rating: 9.5,
      reviews_count: 128,
      open_time: "10:00 - 23:00",
      price_range: "50.000đ - 500.000đ",
      img: "https://placehold.co/800x400/FFF3E0/E65100?text=Hai+San+Tran+Long",
      description:
        "Nhà hàng hải sản tươi sống bậc nhất Sài Gòn với không gian thoáng mát...",
      menu: [
        { name: "Tôm hùm", price: "150k", img: "🦞" },
        { name: "Cua rang me", price: "200k", img: "🦀" },
        { name: "Lẩu Thái", price: "350k", img: "🍲" },
        { name: "Hàu nướng", price: "20k", img: "🦪" },
      ],
      reviews: [
        {
          user: "Nguyễn Văn A",
          rating: 10,
          content: "Hải sản tươi, nước chấm ngon!",
          date: "20/11/2025",
        },
      ],
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-wrapper">
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "6px solid #f3f3f3",
              borderTop: "6px solid #E65100",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Đang tải thông tin nhà hàng...
          </p>
        </div>
        <Footer />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state (nhưng vẫn hiển thị mock data)
  if (!restaurant) {
    return (
      <div className="page-wrapper">
        <Header />
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <p style={{ fontSize: "60px", marginBottom: "20px" }}>😢</p>
          <h2 style={{ color: "#E65100", marginBottom: "15px" }}>
            Không tìm thấy nhà hàng
          </h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Nhà hàng này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Link
            to="/explore"
            style={{
              padding: "12px 30px",
              background: "#E65100",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "30px",
              fontWeight: "600",
            }}
          >
            Khám phá nhà hàng khác
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />

      <div
        className="container"
        style={{ marginTop: "30px", marginBottom: "50px" }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
          <Link to="/" style={{ color: "#E65100", textDecoration: "none" }}>
            Trang chủ
          </Link>
          <span style={{ margin: "0 10px" }}>/</span>
          <Link
            to="/explore"
            style={{ color: "#E65100", textDecoration: "none" }}
          >
            Khám phá
          </Link>
          <span style={{ margin: "0 10px" }}>/</span>
          <span>{restaurant.name}</span>
        </div>

        {/* Main Image */}
        <div
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            marginBottom: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={restaurant.img}
            alt={restaurant.name}
            style={{ width: "100%", height: "350px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src =
                "https://placehold.co/800x400/FFF3E0/E65100?text=Restaurant";
            }}
          />
        </div>

        {/* Info Section */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "300px" }}>
            {/* Category Badge */}
            {restaurant.category && (
              <span
                style={{
                  display: "inline-block",
                  background: "#FFF3E0",
                  color: "#E65100",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                {restaurant.category}
              </span>
            )}

            <h1
              style={{
                color: "#E65100",
                fontSize: "32px",
                fontWeight: "800",
                marginBottom: "10px",
              }}
            >
              {restaurant.name}
            </h1>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "8px" }}>
              <b>Địa chỉ:</b> {restaurant.address}
            </p>
            <p
              style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}
            >
              <b>Giờ mở:</b> {restaurant.open_time} | <b>Giá:</b> {" "}
              {restaurant.price_range}
            </p>

            {/* Description */}
            <div
              style={{
                background: "#FFF3E0",
                padding: "20px",
                borderRadius: "12px",
                borderLeft: "5px solid #E65100",
              }}
            >
              <p>{restaurant.description}</p>
            </div>

            {/* Scores */}
            {restaurant.scores && Object.keys(restaurant.scores).length > 0 && (
              <div style={{ marginTop: "25px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    marginBottom: "15px",
                    color: "#333",
                  }}
                >
                  Điểm chi tiết
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {Object.entries(restaurant.scores).map(
                    ([key, value]) =>
                      value > 0 && (
                        <div
                          key={key}
                          style={{
                            background: "#f8f9fa",
                            padding: "10px 15px",
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <span style={{ color: "#666" }}>{key}: </span>
                          <span style={{ color: "#E65100", fontWeight: "700" }}>
                            {value}/5
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rating Card */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
              textAlign: "center",
              height: "fit-content",
            }}
          >
            <div
              style={{ fontSize: "48px", fontWeight: "900", color: "#E65100" }}
            >
              {restaurant.rating > 5
                ? restaurant.rating
                : (restaurant.rating * 2).toFixed(1)}
            </div>
            <div
              style={{ fontSize: "14px", color: "#888", marginBottom: "10px" }}
            >
              {restaurant.rating > 5 ? "trên 10 điểm" : "trên 5 sao"}
            </div>
            <div
              style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}
            >
              {restaurant.reviews_count} đánh giá
            </div>
            <button
              className="btn-sm register"
              style={{ width: "100%", padding: "12px", fontSize: "16px" }}
            >
              Viết đánh giá
            </button>
          </div>
        </div>

        {/* Menu Section */}
        <div style={{ marginTop: "50px" }}>
          <h2 className="section-title">THỰC ĐƠN NỔI BẬT</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "20px",
            }}
          >
            {restaurant.menu.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fff",
                  padding: "15px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>
                  {item.img}
                </div>
                <h4 style={{ fontSize: "16px", marginBottom: "5px" }}>
                  {item.name}
                </h4>
                <p style={{ color: "#E65100", fontWeight: "bold" }}>
                  {item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <div style={{ marginTop: "50px" }}>
            <h2 className="section-title">ĐÁNH GIÁ GẦN ĐÂY</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {restaurant.reviews.map((review, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ fontWeight: "700", color: "#333" }}>
                      {review.user}
                    </span>
                    <span style={{ color: "#E65100", fontWeight: "600" }}>
                      ⭐ {review.rating}
                    </span>
                  </div>
                  <p style={{ color: "#555", marginBottom: "8px" }}>
                    {review.content}
                  </p>
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {review.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Restaurants */}
        <div
          style={{
            marginTop: "50px",
            textAlign: "center",
            padding: "40px",
            background: "#FFF3E0",
            borderRadius: "20px",
          }}
        >
          <h3 style={{ color: "#E65100", marginBottom: "15px" }}>
            Bạn có thể thích
          </h3>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Khám phá thêm nhiều nhà hàng ngon khác tại Chewz!
          </p>
          <Link
            to="/explore"
            className="btn-sm register"
            style={{
              padding: "12px 30px",
              fontSize: "16px",
              textDecoration: "none",
            }}
          >
            🍽️ Xem thêm nhà hàng
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetailPage;
