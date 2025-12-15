// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "leaflet/dist/leaflet.css";
import "./map/leafletFix";
import FoodTourPage from "./pages/FoodTourPage";
import FoodTourEditPage from "./pages/FoodTourEditPage";
import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";
import HomePage from "./pages/HomePage"; // 🔁 Dùng làm trang chủ duy nhất
import About from "./pages/About";
import History from "./pages/History";
import SignInPage from "./pages/auth/SignInPage";
import SignupPage from "./pages/auth/SignupPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import CategoryPage from "./pages/CategoryPage";
import RestaurantsPage from "./pages/RestaurantsPage";
import AdvancedSearchPage from "./pages/AdvancedSearchPage";

import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/test/Search";

function App() {
  const { user } = useAuth(); // Lấy thông tin user

  return (
    <Routes>
      {/* TRANG CHỦ: luôn dùng HomePage (đã merge giao diện Landing + Home) */}
      <Route path="/" element={<HomePage />} />

      {/* Nếu đã đăng nhập mà cố vào Login -> Đá về trang chủ */}
      <Route
        path="/signin"
        element={!user ? <SignInPage /> : <Navigate to="/" />}
      />
      <Route
        path="/login"
        element={!user ? <SignInPage /> : <Navigate to="/" />}
      />

      <Route
        path="/signup"
        element={!user ? <SignupPage /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!user ? <SignupPage /> : <Navigate to="/" />}
      />

      <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />

      {/* Trang Khám phá / danh sách nhà hàng */}
      <Route path="/explore" element={<RestaurantsPage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />

      {/* Các trang khác */}
      <Route path="/about" element={<About />} />
      <Route path="/history" element={<History />} />
      <Route path="/category/:slug" element={<CategoryPage />} />

      <Route
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" />}
      />
      <Route path="/search" element={<SearchPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/search-advanced" element={<AdvancedSearchPage />} />

      <Route path="/food-tour" element={<ErrorBoundary><FoodTourPage /></ErrorBoundary>} />
      <Route path="/food-tour/:tourId" element={
        <ErrorBoundary>
          <FoodTourEditPage />
        </ErrorBoundary>
      } />

      {/* Route 404 (Nếu người dùng gõ link bậy bạ) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
