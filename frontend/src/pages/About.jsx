import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer"; // <--- Footer dùng chung

const API_BASE_URL = "http://localhost:5000/api";

const About = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/about/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gửi liên hệ thất bại");
      }

      alert(
        "Cảm ơn bạn! Chúng tôi đã nhận được thư và sẽ phản hồi sớm nhất. 🧡"
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Lỗi gửi thư:", error);
      alert(error.message || "Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      <div className="about-hero">
        <div className="container">
          <h1>Về Chúng Tôi</h1>
          <p>Hành trình mang hương vị ẩm thực đến gần bạn hơn cùng Chewz.</p>
        </div>
      </div>

      <div className="container about-content">
        <section className="about-section">
          <div className="about-text">
            <h2>Câu Chuyện Thương Hiệu</h2>
            <p>
              Được thành lập vào năm 2025, <b>Chewz</b> không chỉ là một ứng
              dụng tìm kiếm nhà hàng. Chúng tôi là người bạn đồng hành sành ăn,
              giúp bạn khám phá những góc ẩm thực tuyệt vời nhất tại Sài Gòn.
            </p>
            <p>
              Sứ mệnh của chúng tôi là kết nối con người qua những bữa ăn ngon,
              với tông màu cam rực rỡ tượng trưng cho sự nhiệt huyết và hương vị
              bùng nổ.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://placehold.co/600x400/FFF3E0/E65100?text=Chewz+Team"
              alt="Team"
            />
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-box">
            <h3>500+</h3>
            <p>Đối tác</p>
          </div>
          <div className="stat-box">
            <h3>10k+</h3>
            <p>Thực khách</p>
          </div>
          <div className="stat-box">
            <h3>4.9/5</h3>
            <p>Đánh giá App</p>
          </div>
        </section>

        {/* --- FORM LIÊN HỆ --- */}
        <section style={{ marginTop: "60px", marginBottom: "60px" }}>
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(230, 81, 0, 0.1)",
              border: "1px solid #FFE0B2",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                color: "#E65100",
                marginBottom: "10px",
              }}
            >
              Liên Hệ Với Chúng Tôi
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginBottom: "30px",
              }}
            >
              Bạn có câu hỏi hoặc muốn hợp tác? Hãy để lại lời nhắn nhé!
            </p>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Họ tên
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Chủ đề
                </label>
                <input
                  required
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Vd: Hợp tác / Góp ý..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Nội dung
                </label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Nhập nội dung..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    outline: "none",
                    resize: "vertical",
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-register"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  background: loading ? "#ccc" : "#E65100",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "0.3s",
                }}
              >
                {loading ? "ĐANG GỬI..." : "GỬI TIN NHẮN 🚀"}
              </button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
