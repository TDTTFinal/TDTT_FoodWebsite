import api from "../config/api";

const HISTORY_KEY = "viewed_restaurants";
const MAX_HISTORY = 20;

export const historyService = {
  // ========================
  // LocalStorage Methods
  // ========================
  
  // Get history from local storage
  getLocalHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch (e) {
      console.error("Error parsing history:", e);
      return [];
    }
  },

  // Add item to local history
  addToLocalHistory: (restaurant) => {
    try {
      let history = historyService.getLocalHistory();
      
      // Remove duplicate if exists
      history = history.filter(item => item.id !== restaurant.id);
      
      // Create history item
      const newItem = {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        img: restaurant.img,
        rating: restaurant.rating,
        category: restaurant.category,
        viewedAt: new Date().toISOString()
      };
      
      // Add to beginning
      history.unshift(newItem);
      
      // Limit size
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return newItem;
    } catch (e) {
      console.error("Error saving history:", e);
      return null;
    }
  },

  // Clear local history
  clearLocalHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  },

  // Remove single item from local
  removeFromLocalHistory: (id) => {
    let history = historyService.getLocalHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  },

  // ========================
  // API Methods
  // ========================

  // Get view history from server
  getViewHistory: async () => {
    try {
      const res = await api.get("/history/views?limit=50");
      return res.success ? res.data : [];
    } catch (error) {
      console.error("API Get View History Error:", error);
      return [];
    }
  },

  // Save view to server
  saveViewHistory: async (restaurantId) => {
    try {
      await api.post("/history/views", { restaurantId });
    } catch (error) {
      console.error("API Save View History Error:", error);
    }
  },

  // Remove view from server
  removeViewHistory: async (restaurantId) => {
    try {
      await api.delete(`/history/views/${restaurantId}`);
    } catch (error) {
      console.error("API Remove View History Error:", error);
    }
  },

  // Clear all server history
  clearViewHistory: async () => {
    try {
      await api.delete("/history/views");
    } catch (error) {
      console.error("API Clear View History Error:", error);
    }
  },

  // Sync local history to server
  syncHistory: async () => {
    try {
      const localHistory = historyService.getLocalHistory();
      if (localHistory.length === 0) return;

      const items = localHistory.map(h => ({
        id: h.id,
        viewedAt: h.viewedAt
      }));

      await api.post("/history/sync", { items });
      
      // Optional: Clear local after sync or keep as cache?
      // For now we keep as cache.
    } catch (error) {
      console.error("Sync History Error:", error);
    }
  },

  // Get review history
  getReviewHistory: async () => {
    try {
      const res = await api.get("/history/reviews");
      return res.success ? res.data : [];
    } catch (error) {
      console.error("API Get Review History Error:", error);
      return [];
    }
  }
};
