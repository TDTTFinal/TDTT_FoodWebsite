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
      setError("Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-page-label">Sign up</div>

      <div className="auth-wrapper signup-mode">
        <div className="auth-signup-layout">
          {/* LOGO BÊN TRÁI */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="auth-logo-box signup-logo-square">
              <div className="auth-logo-circle signup-logo-circle">
                TRAVEL &amp; TOURISM
                <br />
                LOGO
              </div>
            </div>
          </div>

          {/* FORM BÊN PHẢI */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div className="auth-form-shell">
              <h1 className="auth-title">ĐĂNG KÝ</h1>

              {error && (
                <p style={{ color: "red", marginBottom: 8, fontSize: 14 }}>
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-group">
                  <label className="auth-label" htmlFor="name">
                    Họ và tên
                  </label>
                  <input
                    className="auth-input"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="phone">
                    Số điện thoại (tuỳ chọn)
                  </label>
                  <input
                    className="auth-input"
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="0123 456 789"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="address">
                    Địa chỉ (tuỳ chọn)
                  </label>
                  <input
                    className="auth-input"
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Quận 1, TP.HCM"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="auth-input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="password">
                    Mật khẩu
                  </label>
                  <input
                    className="auth-input"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="confirmPassword">
                    Nhập lại mật khẩu
                  </label>
                  <input
                    className="auth-input"
                    id="confirmPassword"
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
                  className="auth-btn auth-btn-signup"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "ĐĂNG KÝ"}
                </button>

                <div
                  style={{
                    marginTop: "15px",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
