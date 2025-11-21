import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

const API_BASE_URL = "http://localhost:5000/api";

function SignInPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Lưu tạm token + user
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, user: data.user })
      );

      
      
      navigate("/");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-page-label">Sign in</div>

      <div className="auth-wrapper signin-mode">
        <div className="auth-inner">
          {/* LOGO */}
          <div className="auth-logo-area">
            <div className="auth-logo-box signin-logo-outer">
              <div className="auth-logo-circle signin-logo-inner">
                TRAVEL &amp; TOURISM
                <br />
                LOGO
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "red", marginBottom: 8, fontSize: 14 }}>
                {error}
              </p>
            )}

            <div className="auth-group">
              <label className="auth-label" htmlFor="email">
                Email:
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
                Mật khẩu:
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                marginTop: "5px",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />{" "}
                Nhớ mật khẩu
              </label>
              <span>Quên mật khẩu?</span>
            </div>

            <button
              type="submit"
              className="auth-btn auth-btn-login"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </button>

            <div
              style={{
                marginTop: "15px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
