import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import logoImg from "../../assets/logo.svg";

// ✅ Import useAuth
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5000/api";

// ✅ Hàm kiểm tra backend health
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return { healthy: true, data };
    }
    return { healthy: false, error: "Server returned error" };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

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
  const [backendStatus, setBackendStatus] = useState(null);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const navigate = useNavigate();

  // ✅ Lấy hàm login từ AuthContext
  const { login } = useAuth();

  // ✅ Kiểm tra backend status khi component mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkBackendHealth();
      setBackendStatus(health);
      setCheckingBackend(false);
    };
    checkHealth();

    // Kiểm tra lại mỗi 30 giây
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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

    // ✅ Validation đầy đủ
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    if (!form.email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (!form.password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    // ✅ Kiểm tra backend trước khi gửi
    if (!backendStatus?.healthy) {
      setError("⚠️ Server hiện đang offline. Vui lòng thử lại sau.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          address: form.address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      // ✅ OPTION 1: AUTO-LOGIN (Khuyến nghị)
      // Sau khi đăng ký thành công, tự động đăng nhập luôn
      login(data.user, data.token);
      alert("✅ Đăng ký thành công! Chào mừng bạn đến với Chewz.");
      navigate("/");

      // ❌ OPTION 2: MANUAL LOGIN (Code cũ)
      // Uncomment code dưới và comment code trên nếu muốn user phải login thủ công
      // alert("✅ Đăng ký thành công! Hãy đăng nhập.");
      // navigate("/login");
    } catch (err) {
      console.error("Register error:", err);

      // ✅ Xử lý các loại lỗi khác nhau một cách chi tiết
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError(
          "❌ Không thể kết nối đến server.\n\n" +
            "Vui lòng kiểm tra:\n" +
            "1. Backend server đã chạy chưa? (npm start ở thư mục backend)\n" +
            "2. Server đang chạy ở port 5000?\n" +
            "3. Kiểm tra firewall/antivirus"
        );
      } else if (err.message.includes("NetworkError")) {
        setError("❌ Lỗi mạng. Vui lòng kiểm tra kết nối internet.");
      } else if (err.message.includes("Email đã tồn tại")) {
        setError(
          "⚠️ Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
        );
      } else {
        setError(`❌ ${err.message || "Có lỗi xảy ra khi đăng ký"}`);
      }
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
            <Link to="/">
              <img
                src={logoImg}
                alt="Chewz App"
                style={{
                  width: "250px",
                  height: "auto",
                }}
              />
            </Link>
          </div>

          {/* FORM BÊN PHẢI */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div className="auth-form-shell">
              <h1 className="auth-title">ĐĂNG KÝ</h1>

              {/* ✅ Hiển thị trạng thái backend */}
              {checkingBackend && (
                <div
                  style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  🔄 Đang kiểm tra kết nối server...
                </div>
              )}

              {!checkingBackend && !backendStatus?.healthy && (
                <div
                  style={{
                    backgroundColor: "#fee",
                    border: "1px solid #f66",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}
                >
                  <strong>⚠️ Cảnh báo:</strong> Không thể kết nối đến server.
                  <br />
                  Vui lòng khởi động backend trước khi đăng ký.
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    Lỗi: {backendStatus?.error}
                  </div>
                </div>
              )}

              {!checkingBackend && backendStatus?.healthy && (
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    border: "1px solid #28a745",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "12px",
                    textAlign: "center",
                    color: "#155724",
                  }}
                >
                  ✅ Server đang hoạt động
                </div>
              )}

              {/* ✅ Hiển thị lỗi với format tốt hơn */}
              {error && (
                <div
                  style={{
                    color: "#dc3545",
                    backgroundColor: "#fee",
                    border: "1px solid #dc3545",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "14px",
                    whiteSpace: "pre-line",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="auth-group">
                  <label className="auth-label" htmlFor="name">
                    Họ và tên <span style={{ color: "red" }}>*</span>
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
                    Email <span style={{ color: "red" }}>*</span>
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
                    Mật khẩu <span style={{ color: "red" }}>*</span>
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
                    minLength={6}
                  />
                  <small style={{ fontSize: "11px", color: "#666" }}>
                    Ít nhất 6 ký tự
                  </small>
                </div>

                <div className="auth-group">
                  <label className="auth-label" htmlFor="confirmPassword">
                    Nhập lại mật khẩu <span style={{ color: "red" }}>*</span>
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
                  disabled={loading || !backendStatus?.healthy}
                  style={{
                    opacity: loading || !backendStatus?.healthy ? 0.6 : 1,
                    cursor:
                      loading || !backendStatus?.healthy
                        ? "not-allowed"
                        : "pointer",
                  }}
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
