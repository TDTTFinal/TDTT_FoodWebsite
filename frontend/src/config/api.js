import axios from "axios";

// Tạo instance axios với config mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

// Interceptor cho request (nếu cần thêm token sau này)
api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const { token } = JSON.parse(storedAuth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Ignore error
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => response.data, // Trả về data trực tiếp cho tiện
  (error) => {
    // Xử lý lỗi chung (VD: 401 -> logout)
    if (error.response && error.response.status === 401) {
      // Có thể dispatch logout event hoặc redirect
    }
    return Promise.reject(error);
  }
);

export default api;
