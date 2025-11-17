import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth.css";

function SignInPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign in form:", form);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signin">
        {/* logo bên trên */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <div className="auth-logo-box">
            <div className="auth-logo-circle">LOGO</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>

          <div className="auth-field">
            <label>Mật khẩu</label>
            <input
              className="auth-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="auth-row-between">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                style={{ marginRight: 6 }}
              />
              Nhớ mật khẩu
            </label>
            <a>Quên mật khẩu?</a>
          </div>

          <button type="submit" className="auth-button auth-button--primary">
            ĐĂNG NHẬP
          </button>
        </form>

        <p className="auth-bottom-text">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
