import { useState } from "react"; // dùng để quản lý state form
import { Link, useNavigate } from "react-router-dom"; // dùng để chuyển sang trang đăng ký mà không cần reload "Link"
// useNavigate: useNavigate cho phép chuyển trang bằng code (vd: sau khi login xong → navigate("/")).
import "../../styles/auth.css";

// useNavigate: giúp cho việc sau khi đăng nhập thành công thì điều hướng sang trang khác


const API_BASE_URL = "http://localhost:5000/api";
// Mục đích: gom base URL của backend vào 1 chỗ:
// Sau này nếu đổi port/host (VD deploy lên server) → sửa 1 dòng này là xong.

function SignInPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false); // dùng để biết đang gửi request : hiển thị "đang xử lý..."
  const [error, setError] = useState(""); // dùng để lưu thông báo lỗi để hiển thị ra UI
  const navigate = useNavigate(); // dùng cho phần import ở trên để chuyển trang

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

      // lưu token + user tạm thời vào localStorage
      localStorage.setItem(
        "auth",
        JSON.stringify({ token: data.token, user: data.user })
      );

      alert("Đăng nhập thành công!");
      navigate("/"); // sau này sẽ là trang Home thật sự
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signin">
        <div className="auth-card__left">
          <div className="auth-logo-box">
            <div className="auth-logo-circle"></div>
            <p>Logo</p>
          </div>
        </div>

        <div className="auth-card__right">
          <h1 className="auth-title">Đăng nhập</h1>

          {error && (
            <p style={{ color: "red", marginBottom: 8, fontSize: 14 }}>
              {error}
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
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

            <div className="auth-row-between">
              <label style={{ fontSize: 14 }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  style={{ marginRight: 6 }}
                />
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="auth-button auth-button--primary"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          <p className="auth-bottom-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;


