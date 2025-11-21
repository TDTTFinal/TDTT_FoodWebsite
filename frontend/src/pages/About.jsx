// src/pages/About.jsx
import React from "react";
import Header from "../components/Header";

const About = () => {
  return (
    <div className="page-container">
      <Header />

      <div className="about-hero">
        <h1>Về Chúng Tôi</h1>
        <p>Hành trình mang hương vị ẩm thực đến gần bạn hơn.</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div style={{ flex: 1 }}>
            <h2>Câu Chuyện Thương Hiệu</h2>
            <p>
              Được thành lập vào năm 2025, sứ mệnh của chúng tôi là "No Silent
              Treatment" - Không để chiếc bụng đói nào bị bỏ rơi.
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <img
              src="https://placehold.co/400x300?text=Our+Team"
              style={{ width: "100%", borderRadius: "10px" }}
              alt="Team"
            />
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-box">
            <h3>500+</h3>
            <p>Đối tác</p>
          </div>
          <div className="stat-box">
            <h3>10k+</h3>
            <p>Khách hàng</p>
          </div>
          <div className="stat-box">
            <h3>98%</h3>
            <p>Hài lòng</p>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-copyright">© 2025 No Silent Treatment.</div>
      </footer>
    </div>
  );
};

export default About;
