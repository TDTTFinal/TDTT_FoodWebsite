import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./index.css"
import LandingPage from "./pages/LandingPage.jsx";
import About from "./pages/About.jsx";
import History from "./pages/History.jsx";

import SignInPage from "./pages/auth/SignInPage.jsx";
import SignUpPage from "./pages/auth/SignupPage.jsx";
import Search from "./pages/test/Search.jsx";

function App() {
  return (
    <Routes>
      {/* Trang chủ landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Các trang tĩnh */}
      <Route path="/about" element={<About />} />
      <Route path="/history" element={<History />} />

      {/* Auth: tạo alias để dễ nhớ */}
      <Route path="/login" element={<SignInPage />} />
      <Route path="/signin" element={<SignInPage />} />

      <Route path="/register" element={<SignUpPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/*Để quochoc test api */}
      <Route path="/search" element={<Search />} /> 

      {/* Route không tồn tại */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
