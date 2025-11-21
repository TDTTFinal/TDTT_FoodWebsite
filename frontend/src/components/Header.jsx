// src/components/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const Header = () => {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <header className="header">
      {/* CONTAINER GIÚP NỘI DUNG VÀO GIỮA */}
      <div className="container top-bar">
        <Link
          to="/"
          className="logo-small"
          style={{
            textDecoration: "none",
            color: "#000",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          LOGO
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={isActive("/")}>
            TRANG CHỦ
          </Link>
          <a href="#" className="nav-item">
            TÌM KIẾM NÂNG CAO
          </a>
          <a href="#" className="nav-item">
            DANH MỤC
          </a>
          <Link to="/history" className={isActive("/history")}>
            LỊCH SỬ
          </Link>
          <Link to="/about" className={isActive("/about")}>
            ABOUT
          </Link>
        </nav>

        <div className="auth-buttons">
          <div className="user-icon">👤 TÀI KHOẢN</div>
          <div className="btn-group">
            <Link to="/signin" className="btn-sm login">
              Đăng nhập
            </Link>
            <Link to="/signup" className="btn-sm register">
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
