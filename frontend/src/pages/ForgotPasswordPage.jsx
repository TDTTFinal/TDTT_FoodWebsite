// src/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ⏳ thời gian chờ gửi lại

  // Link API (nhớ check file .env nha)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Đếm ngược cooldown
  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Nếu đang trong thời gian chờ thì không cho gửi nữa
    if (cooldown > 0) {
      setError(`Bạn vừa yêu cầu rồi, vui lòng đợi ${cooldown}s nữa nha.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend có thể trả 429 + message "vui lòng thử lại sau X giây"
        throw new Error(data.message || "Lỗi rồi bà ơi!");
      }

      // Thành công
      setMessage(
        data.message || "📧 Link xác nhận đã được gửi! Bà check email ngay nha."
      );

      // Bắt đầu cooldown 60s (tùy bạn chỉnh 30, 90, 120...)
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || cooldown > 0;

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Quên mật khẩu?</h2>
        <p className="auth-subtitle">
          Đừng lo, chuyện nhỏ! Nhập email vào đây tụi tui gửi lại mật khẩu cho.
        </p>

        {message && <div className="alert-box alert-success">{message}</div>}
        {error && <div className="alert-box alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email của bà</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={isDisabled}>
            {loading
              ? "Đang gửi..."
              : cooldown > 0
              ? `Gửi lại sau ${cooldown}s`
              : "Gửi link khôi phục"}
          </button>
        </form>

        <Link to="/login" className="back-link">
          ← Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
