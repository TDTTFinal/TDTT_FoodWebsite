import axios from "axios";

// Base URL của backend API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Restaurant API Service
export const restaurantAPI = {
  /**
   * Lấy danh sách nhà hàng với filter và phân trang
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng items mỗi trang
   * @param {string} params.category - Danh mục lọc
   * @param {string} params.search - Từ khóa tìm kiếm
   * @param {number} params.minRating - Rating tối thiểu
   * @param {string} params.sortBy - Sắp xếp theo field
   * @param {string} params.order - Thứ tự sắp xếp (asc/desc)
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/restaurants", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một nhà hàng
   * @param {string} id - ID của nhà hàng
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách nhà hàng nổi bật
   * @param {number} limit - Số lượng nhà hàng lấy về
   */
  getFeatured: async (limit = 50) => {
    try {
      const response = await api.get("/restaurants/featured", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching featured restaurants:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê danh mục
   */
  getCategoryStats: async () => {
    try {
      const response = await api.get("/restaurants/categories/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching category stats:", error);
      throw error;
    }
  },

  /**
   * Tạo nhà hàng mới (Admin)
   * @param {Object} data - Dữ liệu nhà hàng
   */
  create: async (data) => {
    try {
      const response = await api.post("/restaurants", data);
      return response.data;
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  },

  /**
   * Cập nhật nhà hàng (Admin)
   * @param {string} id - ID của nhà hàng
   * @param {Object} data - Dữ liệu cập nhật
   */
  update: async (id, data) => {
    try {
      const response = await api.put(`/restaurants/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating restaurant ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa nhà hàng (Admin)
   * @param {string} id - ID của nhà hàng
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting restaurant ${id}:`, error);
      throw error;
    }
  },
};

// Export default api instance để có thể dùng cho các API khác
export default api;
