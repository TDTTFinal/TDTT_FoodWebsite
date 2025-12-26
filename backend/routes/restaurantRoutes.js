const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

// Public routes
router.get("/", restaurantController.getAllRestaurants);
router.get("/featured", restaurantController.getFeaturedRestaurants);

// New Routes for Homepage (Place BEFORE /:id)
router.get("/trending", restaurantController.getTrendingRestaurants);
router.get("/reviews/latest", restaurantController.getLatestReviews);
router.get("/nearby", restaurantController.getNearbyRestaurants);
router.get("/contextual", restaurantController.getContextualRestaurants);
router.get("/collections", restaurantController.getCollectionRestaurants);

router.get("/categories/stats", restaurantController.getCategoryStats);

// Get reviews for a specific restaurant (from reviews collection)
router.get("/:id/reviews", restaurantController.getRestaurantReviews);

router.get("/:id", restaurantController.getRestaurantById);

// Admin routes (có thể thêm middleware auth sau)
router.post("/", restaurantController.createRestaurant);
router.put("/:id", restaurantController.updateRestaurant);
router.delete("/:id", restaurantController.deleteRestaurant);

module.exports = router;

