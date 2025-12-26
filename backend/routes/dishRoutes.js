const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishController");

// Public routes
router.get("/", dishController.getAllDishes);
router.get("/featured", dishController.getFeaturedDishes);
router.get("/categories/stats", dishController.getCategoryStats);
router.get("/:id", dishController.getDishById);

// Admin routes (có thể thêm middleware auth sau)
router.post("/", dishController.createDish);
router.put("/:id", dishController.updateDish);
router.delete("/:id", dishController.deleteDish);

module.exports = router;
