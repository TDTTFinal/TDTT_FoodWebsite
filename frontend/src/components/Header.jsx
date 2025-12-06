import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // <--- Import Auth
import "../App.css";
import logoImg from "../assets/logo-horizontal.svg";

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); // <--- Lấy user và logout

  const isActive = (path) =>
    location.pathname === path ? "nav-item active" : "nav-item";

  return (
    <header className="header">
      <div className="container top-bar">
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logoImg}
            alt="Chewz Logo"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </Link>

        <nav className="nav-menu">
          <Link to="/" className={isActive("/")}>
            TRANG CHỦ
          </Link>
          {/* 🆕 SỬA: Đổi từ href="#" thành Link đến /explore */}
          <Link to="/explore" className={isActive("/explore")}>
            KHÁM PHÁ
          </Link>
          <Link to="/history" className={isActive("/history")}>
            LỊCH SỬ
          </Link>
          <Link to="/about" className={isActive("/about")}>
            ABOUT
          </Link>
        </nav>

        {/* LOGIC ĐỔI NÚT */}
        <div className="auth-buttons">
          {user ? (
            // === USER ĐÃ ĐĂNG NHẬP ===
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  Xin chào
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    color: "#E65100",
                    fontSize: "14px",
                  }}
                >
                  {user.name}
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  padding: "6px 15px",
                  background: "#fff",
                  color: "#E65100",
                  border: "1px solid #E65100",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            // === KHÁCH (GUEST) ===
            <>
              <div className="user-icon">👤 TÀI KHOẢN</div>
              <div className="btn-group">
                <Link to="/signin" className="btn-sm login">
                  Đăng nhập
                </Link>
                <Link to="/signup" className="btn-sm register">
                  Đăng ký
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
