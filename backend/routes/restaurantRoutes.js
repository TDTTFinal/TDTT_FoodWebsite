const express = require("express");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  getFeaturedRestaurants,
  getCategoryStats,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

// Public routes
router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/featured", getFeaturedRestaurants);
router.get("/restaurants/categories/stats", getCategoryStats);
router.get("/restaurants/:id", getRestaurantById);

// Admin routes (có thể thêm middleware auth sau)
router.post("/restaurants", createRestaurant);
router.put("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

module.exports = router;
