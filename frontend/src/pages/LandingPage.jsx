// src/pages/LandingPage.jsx
import React, { useRef } from "react";
import Header from "../components/Header";
// import '../App.css'; // Đảm bảo đã import CSS

const LandingPage = () => {
  // 1. DỮ LIỆU DANH MỤC MÓN ĂN (ICON KHÁC NHAU)
  const categories = [
    { name: "Lẩu", icon: "🍲" },
    { name: "BBQ/Nướng", icon: "🔥" },
    { name: "Cơm", icon: "🍚" },
    { name: "Trà sữa", icon: "🧋" },
    { name: "Hải sản", icon: "🦞" },
    { name: "Sushi/Nhật", icon: "🍣" },
    { name: "Mì/Phở", icon: "🍜" },
    { name: "Ăn vặt", icon: "🍟" },
    { name: "Pizza", icon: "🍕" },
    { name: "Burger", icon: "🍔" },
    { name: "Bánh ngọt", icon: "🍰" },
    { name: "Đồ uống", icon: "🍹" },
    { name: "Chay", icon: "🥗" },
    { name: "Healthy", icon: "🥑" },
  ];

  // 2. DỮ LIỆU NHÀ HÀNG
  const restaurants = [
    {
      id: 1,
      name: "Hải sản Trần Long",
      address: "Số 888, Bến Nghé, Q1",
      rating: 9.5,
      img: "https://placehold.co/300x200/FFF3E0/E65100?text=Hai+San",
    },
    {
      id: 2,
      name: "Kichi Kichi",
      address: "Số 12, Võ Văn Tần, Q3",
      rating: 9.5,
      img: "https://placehold.co/300x200/FFF3E0/E65100?text=Kichi",
    },
    {
      id: 3,
      name: "Bít tết Nha Trang",
      address: "Số 5, Nguyễn Trãi, Q5",
      rating: 9.5,
      img: "https://placehold.co/300x200/FFF3E0/E65100?text=Bit+Tet",
    },
    {
      id: 4,
      name: "Gà hấp Đinh Tiên",
      address: "Số 99, CMT8, Q10",
      rating: 9.5,
      img: "https://placehold.co/300x200/FFF3E0/E65100?text=Ga+Hap",
    },
  ];

  // 3. XỬ LÝ SCROLL (TRƯỢT QUA LẠI)
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      // Trượt 200px mỗi lần bấm
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Header />

      {/* SEARCH SECTION */}
      <div className="search-section-bg">
        <div className="container search-content">
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Hôm nay bạn ăn gì?"
              className="main-search"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filter-row">
            <select>
              <option>Khu vực</option>
            </select>
            <select>
              <option>Giá trung bình</option>
            </select>
            <select>
              <option>Món ăn</option>
            </select>
          </div>
        </div>
      </div>

      <main className="container main-content">
        {/* --- SLIDER DANH MỤC MÓN ĂN (CODE MỚI) --- */}
        <div className="category-section">
          {/* Nút Trái */}
          <button className="scroll-btn left" onClick={() => scroll("left")}>
            &#10094;
          </button>

          {/* Khung chứa danh sách cuộn */}
          <div className="category-container" ref={scrollRef}>
            {categories.map((item, index) => (
              <div key={index} className="cat-item">
                <div className="cat-circle">{item.icon}</div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* Nút Phải */}
          <button className="scroll-btn right" onClick={() => scroll("right")}>
            &#10095;
          </button>
        </div>
        {/* --- HẾT PHẦN SLIDER --- */}

        <section>
          <h2 className="section-title">TOP NHÀ HÀNG ĐÁNH GIÁ CAO</h2>
          <div className="card-grid">
            {restaurants.map((res) => (
              <div key={res.id} className="card">
                <img src={res.img} alt={res.name} className="card-img" />
                <div className="card-body">
                  <h3
                    style={{
                      fontSize: "16px",
                      marginBottom: "5px",
                      fontWeight: "700",
                    }}
                  >
                    {res.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    📍 {res.address}
                  </p>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      color: "#E65100",
                      fontWeight: "bold",
                    }}
                  >
                    ⭐ {res.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">GỢI Ý HÔM NAY</h2>
          <div className="card-grid">
            {restaurants.map((res, idx) => (
              <div key={idx} className="card">
                <img
                  src={`https://placehold.co/300x200/FFF3E0/E65100?text=Mon+Ngon+${
                    idx + 1
                  }`}
                  alt="Mon"
                  className="card-img"
                />
                <div className="card-body">
                  <h3
                    style={{
                      fontSize: "16px",
                      marginBottom: "5px",
                      fontWeight: "700",
                    }}
                  >
                    Món Ngon {idx + 1}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    📍 {res.address}
                  </p>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      color: "#E65100",
                      fontWeight: "bold",
                    }}
                  >
                    ⭐ 9.8
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer-bg">
        <div className="container footer-content">
          <div style={{ flex: 1 }}>
            <h4 style={{ color: "#FFB74D" }}>CHEWZ APP</h4>
            <p>Kết nối đam mê ẩm thực.</p>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <p>© 2025 Chewz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
