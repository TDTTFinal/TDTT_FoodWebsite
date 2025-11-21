// src/pages/About.jsx
import React from "react";
import Header from "../components/Header";

const About = () => {
  return (
    <div className="page-wrapper">
      {" "}
      {/* Wrapper chung */}
      <Header />
      {/* Hero Section: Full width nền cam */}
      <div className="about-hero">
        <div className="container">
          {" "}
          {/* Container để nội dung vào giữa */}
          <h1>Về Chúng Tôi</h1>
          <p>Hành trình mang hương vị ẩm thực đến gần bạn hơn cùng Chewz.</p>
        </div>
      </div>
      {/* Nội dung chính: Có Container */}
      <div className="container about-content">
        <section className="about-section">
          <div className="about-text">
            <h2>Câu Chuyện Thương Hiệu</h2>
            <p>
              Được thành lập vào năm 2025, <b>Chewz</b> không chỉ là một ứng
              dụng tìm kiếm nhà hàng. Chúng tôi là người bạn đồng hành sành ăn,
              giúp bạn khám phá những góc ẩm thực tuyệt vời nhất tại Sài Gòn, từ
              những quán vỉa hè đậm chất cho đến những nhà hàng sang trọng bậc
              nhất.
            </p>
            <p>
              Sứ mệnh của chúng tôi là kết nối con người qua những bữa ăn ngon,
              với tông màu cam rực rỡ tượng trưng cho sự nhiệt huyết và hương vị
              bùng nổ.
            </p>
          </div>
          <div className="about-image">
            {/* Thay ảnh placeholder bằng ảnh thật sau này */}
            <img
              src="https://placehold.co/600x400/FFF3E0/E65100?text=Chewz+Team"
              alt="Team"
            />
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-box">
            <h3>500+</h3>
            <p>Đối tác nhà hàng</p>
          </div>
          <div className="stat-box">
            <h3>10k+</h3>
            <p>Thực khách hài lòng</p>
          </div>
          <div className="stat-box">
            <h3>4.9/5</h3>
            <p>Điểm đánh giá App</p>
          </div>
        </section>
      </div>
      <footer className="footer-bg">
        <div className="container footer-content">
          <div style={{ flex: 1 }}>
            <h4 style={{ color: "#FFB74D" }}>CHEWZ APP</h4>
            <p>Kết nối đam mê ẩm thực.</p>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <p>Hotline: 0981669020</p>
            <p>Email: contact@chewz.vn</p>
          </div>
        </div>
        <div className="footer-copyright">
          © 2025 Chewz. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default About;
