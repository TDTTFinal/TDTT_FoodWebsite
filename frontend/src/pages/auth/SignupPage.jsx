import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

const API_BASE_URL = "http://localhost:5000/api";

function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          // phone, address tạm chưa lưu DB, sau này bổ sung schema User cũng được
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signup">
        <div className="auth-card__left">
          <div className="auth-logo-box">
            <div className="auth-logo-circle">🍣</div>
            <p>Khám phá quán ăn theo gu của bạn</p>
          </div>
        </div>

        <div className="auth-card__right">
          <h1 className="auth-title">Đăng ký tài khoản</h1>

          {error && (
            <p style={{ color: "red", marginBottom: 8, fontSize: 14 }}>
              {error}
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                className="auth-input"
                name="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Số điện thoại (tuỳ chọn)</label>
              <input
                className="auth-input"
                name="phone"
                type="text"
                placeholder="0123 456 789"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label>Địa chỉ (tuỳ chọn)</label>
              <input
                className="auth-input"
                name="address"
                type="text"
                placeholder="Quận 1, TP.HCM"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                className="auth-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Mật khẩu</label>
              <input
                className="auth-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Nhập lại mật khẩu</label>
              <input
                className="auth-input"
                name="confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button auth-button--primary"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
            </button>
          </form>

          <p className="auth-bottom-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
