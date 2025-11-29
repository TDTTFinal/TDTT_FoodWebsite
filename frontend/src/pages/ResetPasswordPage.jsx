import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import axios from "../api/axios"; // hoặc 'axios'

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      setMessage(data.message || "Đặt lại mật khẩu thành công.");

      // Chờ 1-2s rồi quay về login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra. Token có thể đã hết hạn."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Đặt lại mật khẩu</h1>
        <p className="auth-subtitle">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={password}
            placeholder="Nhập mật khẩu mới"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Nhập lại mật khẩu</label>
          <input
            type="password"
            value={confirmPassword}
            placeholder="Nhập lại mật khẩu"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
