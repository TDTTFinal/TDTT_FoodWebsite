// src/pages/LandingPage.jsx
import React from "react";
import Header from "../components/Header";
// import '../App.css'; // Đảm bảo đã import CSS

const LandingPage = () => {
  const restaurants = [
    {
      id: 1,
      name: "Hải sản Trần Long",
      address: "Số 888, Bến Nghé, Q1",
      rating: 9.5,
      img: "https://placehold.co/300x200?text=Hai+San",
    },
    {
      id: 2,
      name: "Kichi Kichi",
      address: "Số 12, Võ Văn Tần, Q3",
      rating: 9.5,
      img: "https://placehold.co/300x200?text=Kichi",
    },
    {
      id: 3,
      name: "Bít tết Nha Trang",
      address: "Số 5, Nguyễn Trãi, Q5",
      rating: 9.5,
      img: "https://placehold.co/300x200?text=Bit+Tet",
    },
    {
      id: 4,
      name: "Gà hấp Đinh Tiên",
      address: "Số 99, CMT8, Q10",
      rating: 9.5,
      img: "https://placehold.co/300x200?text=Ga+Hap",
    },
  ];

  return (
    <div>
      {" "}
      {/* Div bao ngoài cùng không cần class */}
      <Header />
      {/* KHU VỰC SEARCH: Nền xanh full width */}
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
            <select>
              <option>Phù hợp</option>
            </select>
            <select>
              <option>Đồ ăn</option>
            </select>
          </div>
        </div>
      </div>
      {/* KHU VỰC NỘI DUNG CHÍNH: Có container để vào giữa */}
      <main className="container main-content">
        <div className="category-icons">
          {[
            "Lẩu",
            "Buffet",
            "Nướng",
            "Hải sản",
            "Nhậu",
            "Sushi",
            "Món chay",
          ].map((item, index) => (
            <div key={index} className="cat-item">
              <div className="cat-circle">🍲</div>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <section>
          <h2 className="section-title">TOP NHÀ HÀNG ĐÁNH GIÁ CAO</h2>
          <div className="card-grid">
            {restaurants.map((res) => (
              <div key={res.id} className="card">
                <img src={res.img} alt={res.name} className="card-img" />
                <div className="card-body">
                  <h3 style={{ fontSize: "15px", marginBottom: "5px" }}>
                    {res.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    📍 {res.address}
                  </p>
                  <div style={{ fontSize: "12px", marginTop: "8px" }}>
                    Số điểm đánh giá: <b>{res.rating}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">TOP MÓN VIỆT</h2>
          <div className="card-grid">
            {restaurants.map((res, idx) => (
              <div key={idx} className="card">
                <img
                  src={`https://placehold.co/300x200?text=Mon+Viet+${idx + 1}`}
                  alt="Mon"
                  className="card-img"
                />
                <div className="card-body">
                  <h3 style={{ fontSize: "15px", marginBottom: "5px" }}>
                    Cơm quê Món {idx + 1}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    📍 {res.address}
                  </p>
                  <div style={{ fontSize: "12px", marginTop: "8px" }}>
                    Số điểm đánh giá: <b>9.5</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {/* FOOTER: Nền trắng full width, nội dung vào giữa */}
      <footer className="footer-bg">
        <div className="container footer-content">
          <div style={{ textAlign: "center" }}>
            <div
              className="logo-circle"
              style={{
                width: "100px",
                height: "100px",
                fontSize: "11px",
                margin: "0 auto",
              }}
            >
              TRAVEL &<br />
              TOURISM
            </div>
          </div>

          <div style={{ fontSize: "13px" }}>
            <h4 style={{ marginBottom: "15px" }}>THÔNG TIN LIÊN HỆ</h4>
            <p style={{ marginBottom: "8px" }}>
              Email: daynuitruongson@gmail.com
            </p>
            <p style={{ marginBottom: "8px" }}>Hotline: 0981669020</p>
            <p>Địa chỉ: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM</p>
          </div>

          <div style={{ fontSize: "13px" }}>
            <h4 style={{ marginBottom: "15px" }}>CHÍNH SÁCH</h4>
            <p style={{ marginBottom: "8px" }}>Chính sách nhượng quyền</p>
            <p style={{ marginBottom: "8px" }}>Chính sách đổi trả</p>
            <p>Chính sách bảo hành</p>
          </div>
        </div>
        <div className="footer-copyright">
          © 2025 No Silent Treatment. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
