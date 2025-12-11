import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";

import logoImg from "../../assets/logo.svg";

// ✅ Import useAuth để sử dụng login từ AuthContext
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

function SignInPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null); // Store auth data temporarily
  const navigate = useNavigate();

  // ✅ Lấy hàm login từ AuthContext
  const { login } = useAuth();

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

      // Check role
      if (data.user.role === "admin") {
        setPendingAuth({ user: data.user, token: data.token });
        setShowAdminModal(true);
      } else {
        // Only login immediately if not admin (or if we want direct redirect)
        login(data.user, data.token);
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
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

      if (data.user.role === "admin") {
        setPendingAuth({ user: data.user, token: data.token });
        setShowAdminModal(true);
      } else {
        login(data.user, data.token);
        navigate("/");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message || "Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      {/* Admin Choice Modal */}
      {showAdminModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#333" }}>Chào mừng Admin</h3>
            <p style={{ color: "#666", margin: "15px 0" }}>
              Bạn muốn vào Trang Admin hay dùng Web như User?
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  if (pendingAuth) {
                    login(pendingAuth.user, pendingAuth.token);
                  }
                  window.location.href = "http://localhost:5174";
                }}
                style={{
                  padding: "10px",
                  backgroundColor: "#ff6600",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Vào Trang Admin
              </button>
              <button
                onClick={() => {
                  if (pendingAuth) {
                    login(pendingAuth.user, pendingAuth.token);
                  }
                  setShowAdminModal(false);
                  navigate("/");
                }}
                style={{
                  padding: "10px",
                  backgroundColor: "#f0f0f0",
                  color: "#333",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Dùng Web như User
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="auth-page-label">Sign in</div>

      <div className="auth-wrapper signin-mode">
        <div className="auth-inner">
          <div className="auth-logo-area">
            <Link to="/">
              <img
                src={logoImg}
                alt="Chewz App"
                style={{
                  width: "180px",
                  height: "auto",
                  marginBottom: "10px",
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
              <Link
                to="/forgot-password"
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                Quên mật khẩu?
              </Link>
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
