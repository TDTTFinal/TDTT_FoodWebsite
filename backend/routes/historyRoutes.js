const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ViewHistory = require("../models/ViewHistory");
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");

// ========================
// GET /api/history/views - Get user's view history
// ========================
router.get("/views", protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const history = await ViewHistory.find({ user: req.user._id })
      .populate("restaurant", "name address avatar_url avg_rating category")
      .sort({ viewedAt: -1 })
      .limit(parseInt(limit));

    const validHistory = history.filter(h => h.restaurant);

    res.json({
      success: true,
      data: validHistory.map((h) => ({
        id: h.restaurant._id,
        name: h.restaurant.name,
        address: h.restaurant.address,
        img: h.restaurant.avatar_url,
        rating: h.restaurant.avg_rating,
        category: h.restaurant.category,
        viewedAt: h.viewedAt,
      })),
    });
  } catch (error) {
    console.error("Get view history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/history/views - Add to view history
// ========================
router.post("/views", protect, async (req, res) => {
  try {
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: "Restaurant ID is required",
      });
    }

    // Upsert: update viewedAt if exists, create if not
    await ViewHistory.findOneAndUpdate(
      { user: req.user._id, restaurant: restaurantId },
      { viewedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "View history saved" });
  } catch (error) {
    console.error("Save view history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// DELETE /api/history/views/:id - Remove from view history
// ========================
router.delete("/views/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    await ViewHistory.findOneAndDelete({
      user: req.user._id,
      restaurant: id,
    });

    res.json({ success: true, message: "Removed from history" });
  } catch (error) {
    console.error("Delete view history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// DELETE /api/history/views - Clear all view history
// ========================
router.delete("/views", protect, async (req, res) => {
  try {
    await ViewHistory.deleteMany({ user: req.user._id });
    res.json({ success: true, message: "All view history cleared" });
  } catch (error) {
    console.error("Clear view history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// GET /api/history/reviews - Get user's review history
// ========================
router.get("/reviews", protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const reviews = await Review.find({
      user: req.user._id,
      status: "active",
    })
      .populate("restaurant", "name address avatar_url")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: reviews.map((r) => ({
        reviewId: r._id,
        restaurantId: r.restaurant._id,
        restaurantName: r.restaurant.name,
        restaurantAddress: r.restaurant.address,
        restaurantImg: r.restaurant.avatar_url,
        rating: r.rating,
        content: r.content,
        images: r.images,
        createdAt: r.createdAt,
        likesCount: r.likesCount,
      })),
    });
  } catch (error) {
    console.error("Get review history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/history/sync - Sync localStorage history to database
// ========================
router.post("/sync", protect, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, viewedAt }

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, synced: 0 });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { user: req.user._id, restaurant: item.id },
        update: { viewedAt: new Date(item.viewedAt) },
        upsert: true,
      },
    }));

    const result = await ViewHistory.bulkWrite(bulkOps);

    res.json({
      success: true,
      synced: result.upsertedCount + result.modifiedCount,
    });
  } catch (error) {
    console.error("Sync history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
