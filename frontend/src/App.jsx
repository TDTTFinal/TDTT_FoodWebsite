import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // <--- Import Auth

import './App.css'; 
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage'; // <--- Import trang User mới tạo
import About from './pages/About';
import History from './pages/History';
import SignInPage from './pages/auth/SignInPage';
import SignupPage from './pages/auth/SignupPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CategoryPage from './pages/CategoryPage';

function App() {
  const { user } = useAuth(); // Lấy thông tin user

  return (
    <Routes>
      {/* LOGIC QUAN TRỌNG: 
        Nếu có user -> Vào HomePage 
        Nếu chưa -> Vào LandingPage 
      */}
      <Route path="/" element={user ? <HomePage /> : <LandingPage />} />
      
      {/* Nếu đã đăng nhập mà cố vào Login -> Đá về trang chủ */}
      <Route path="/signin" element={!user ? <SignInPage /> : <Navigate to="/" />} />
      <Route path="/login" element={!user ? <SignInPage /> : <Navigate to="/" />} />
      
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <SignupPage /> : <Navigate to="/" />} />

      <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />

      {/* Các trang khác */}
      <Route path="/about" element={<About />} />
      <Route path="/history" element={<History />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
    </Routes>
  );
}

export default App;