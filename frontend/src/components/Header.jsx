import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";
import logolmg from "../assets/logo-horizontal.svg"; // Check lại đường dẫn ảnh logo nha

const Header = () => {
  const location = useLocation();
  const { user } = useAuth(); // Lấy thông tin user từ Context

  // Hàm check active để tô đậm menu đang đứng
  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <header className="header">
      <div className="container top-bar">
        {/* === LOGO === */}
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logolmg}
            alt="Chewz Logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </Link>

        {/* === MENU GIỮA === */}
        <nav className="nav-menu">
          <Link to="/" className={isActive("/")}>
            TRANG CHỦ
          </Link>

          {/* Link này có thể dẫn đến trang Search hoặc để tạm # */}
          <Link to="/search" className={isActive("/search")}>
            TÌM KIẾM NÂNG CAO
          </Link>
          <Link to="/explore" className={isActive("/explore")}>
            KHÁM PHÁ
          </Link>
          <Link to="/history" className={isActive("/history")}>
            LỊCH SỬ
          </Link>
          <Link to="/about" className={isActive("/about")}>
            VỀ CHÚNG TÔI
          </Link>
        </nav>

        {/* === KHU VỰC USER (BÊN PHẢI) === */}
        <div className="auth-buttons">
          {user ? (
            // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP ---
            <Link
              to="/profile"
              className="user-profile-link"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                gap: "12px",
                padding: "5px 10px",
                borderRadius: "30px",
                backgroundColor: "#f8f9fa", // Nền nhẹ cho nổi bật
                border: "1px solid #eee",
              }}
            >
              {/* Tên User */}
              <span
                style={{ color: "#333", fontWeight: "600", fontSize: "14px" }}
              >
                Hi, {user.name || "Bạn mình"}
              </span>

              {/* Avatar Tròn */}
              <img
                src={user.avatar || "https://placehold.co/150"}
                alt="Avatar"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              />
            </Link>
          ) : (
            // --- TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP ---
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                to="/login"
                className="btn-login"
                style={{
                  textDecoration: "none",
                  color: "#333",
                  fontWeight: "600",
                  padding: "8px 16px",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn-register"
                style={{
                  backgroundColor: "#ff6b35",
                  color: "white",
                  padding: "8px 20px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
