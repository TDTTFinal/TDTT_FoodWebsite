import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";

import logoImg from '../../assets/logo.svg';

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

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);

      const idToken = await result.user.getIdToken();

      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập Google thất bại");
      }

      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, user: data.user })
      );

      navigate("/");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-page-label">Sign in</div>

      <div className="auth-wrapper signin-mode">
        <div className="auth-inner">
          <div className="auth-logo-area">
          <Link to="/">
            <img 
                src={logoImg} 
                alt="Chewz App" 
                style={{ 
                    width: '180px',    
                    height: 'auto', 
                    marginBottom: '10px' 
                }} 
            />
            </Link>
          </div>

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

            {/* Nút đăng nhập thường */}
            <button
              type="submit"
              className="auth-btn auth-btn-login"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
            </button>

            {/* Divider nhỏ */}
            <div
              style={{
                margin: "12px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              <hr style={{ flex: 1, borderTop: "1px solid #ddd" }} />
              <span>Hoặc</span>
              <hr style={{ flex: 1, borderTop: "1px solid #ddd" }} />
            </div>

            {/* Nút đăng nhập bằng Google */}
            <button
              type="button"
              className="auth-btn auth-btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                backgroundColor: "#fff",
                color: "#444",
                border: "1px solid #ddd",
              }}
            >
              Đăng nhập bằng Google
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
