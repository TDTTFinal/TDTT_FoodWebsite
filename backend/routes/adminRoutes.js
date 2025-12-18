const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// const { adminAuth } = require("../middleware/adminAuth"); // Sẽ thêm sau

// ============== CATEGORY ROUTES ==============
router.get("/categories", adminController.getAllCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// ============== RESTAURANT ROUTES (Admin view) ==============
router.get("/restaurants", adminController.getAdminRestaurants);
router.post("/restaurants", adminController.createRestaurant);
router.put("/restaurants/:id", adminController.updateRestaurant);
router.delete("/restaurants/:id", adminController.deleteRestaurant);

// ============== STATS ==============
router.get("/stats", adminController.getAdminStats);

// ============== REVIEW ROUTES ==============
router.get("/reviews", adminController.getAllReviews);
router.put("/reviews/:id/approve", adminController.approveReview);
router.put("/reviews/:id/reject", adminController.rejectReview);
router.put("/reviews/:id/restore", adminController.restoreReview);
router.delete("/reviews/:id/permanent", adminController.permanentDeleteReview);
router.delete("/reviews/:id", adminController.deleteReview);

// TODO: Thêm routes cho Foods, Users sau

module.exports = router;
