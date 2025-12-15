// backend/routes/foodTourRoutes.js
const express = require("express");
const router = express.Router();
const FoodTour = require("../models/FoodTour");
const authMiddleware = require("../middleware/authMiddleware"); // middleware check JWT

// POST /api/food-tours
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, tourItems, totalRestaurants } = req.body;

    const tour = await FoodTour.create({
      user: req.user._id,
      name,
      description,
      tourItems,
      totalRestaurants
    });

    res.status(201).json({ success: true, tour });
  } catch (err) {
    console.error("Lỗi tạo FoodTour:", err);
    res.status(500).json({ success: false, message: "Không tạo được Food tour" });
  }
});

// GET /api/food-tours (Lấy danh sách tour của user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("📥 GET /food-tours - User ID:", req.user?._id);
    const tours = await FoodTour.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log("📋 Found tours:", tours.length);
    res.json({ success: true, tours });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách tour:", err.message);
    console.error("❌ Full Error:", err);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách tour" });
  }
});

// GET /api/food-tours/:id (Chi tiết tour)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const tour = await FoodTour.findOne({ _id: req.params.id, user: req.user._id });
    if (!tour) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tour" });
    }
    res.json({ success: true, tour });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi lấy chi tiết tour" });
  }
});

// DELETE /api/food-tours/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const tour = await FoodTour.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tour) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tour để xóa" });
    }
    res.json({ success: true, message: "Đã xóa tour thành công" });
  } catch (err) {
    console.error("Lỗi xóa tour:", err);
    res.status(500).json({ success: false, message: "Lỗi khi xóa tour" });
  }
});

// PUT /api/food-tours/:id (Cập nhật tour)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, tourItems, totalRestaurants } = req.body;
    
    const tour = await FoodTour.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        name, 
        description, 
        tourItems, 
        totalRestaurants,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!tour) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy tour để cập nhật" 
      });
    }
    
    console.log("✅ Updated tour:", tour._id);
    res.json({ success: true, tour });
  } catch (err) {
    console.error("Lỗi cập nhật tour:", err);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi cập nhật tour" 
    });
  }
});

module.exports = router;
