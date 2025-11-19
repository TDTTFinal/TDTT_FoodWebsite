import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function HomePage() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Error parsing auth data:", error);
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, [auth, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
    navigate("/login");
  };

  if (!auth) {
    return null; // hoặc loading tạm
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Xin chào, {auth.user.name || auth.user.email}</h1>
      <p>
        Đây là trang Home tạm. Sau này mình sẽ đổi thành trang gợi ý quán ăn,
        danh sách nhà hàng, planner,...
      </p>

      <p>
        <Link to="/login">Chuyển sang màn hình đăng nhập</Link>
      </p>

      <button onClick={handleLogout}>Đăng xuất</button>
    </div>
  );
}

export default HomePage;
