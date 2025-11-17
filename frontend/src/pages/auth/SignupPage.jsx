import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth.css";

function SignUpPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign up form:", form);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--signup">
        {/* bên trái: logo */}
        <div className="auth-card__left">
          <div className="auth-logo-box">
            <div className="auth-logo-circle">LOGO</div>
          </div>
        </div>

        {/* bên phải: form */}
        <div className="auth-card__right">
          <h1 className="auth-title">ĐĂNG KÝ</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Họ và tên</label>
              <input
                className="auth-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="auth-field">
              <label>Số điện thoại</label>
              <input
                className="auth-input"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="auth-field">
              <label>Địa chỉ</label>
              <input
                className="auth-input"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
              />
            </div>

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
              <label>Nhập mật khẩu</label>
              <input
                className="auth-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
              />
            </div>

            <div className="auth-field">
              <label>Xác nhận mật khẩu</label>
              <input
                className="auth-input"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <button type="submit" className="auth-button">
              ĐĂNG KÝ
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
