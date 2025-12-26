const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Review = require("../models/Review");

// ========================
// GET /api/posts/feed - Get social feed
// ========================
router.get("/feed", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'latest' } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'trending') {
        sortOption = { likesCount: -1, createdAt: -1 };
    }

    const posts = await Post.find({ status: "active" })
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
          path: "review",
          select: "title rating content images tags likes"
      })
      .populate("user", "name avatar")
      .populate("restaurant", "name address avg_rating");

    const total = await Post.countDocuments({ status: "active" });

    // Format for frontend (flattening the structure a bit if needed)
    // The frontend currently expects review objects directly in some places, 
    // but we can adjust the frontend or reshape here.
    // Let's decide to return the Post object as is, but frontend needs adaptation.
    // OR we can reshape to look like the old 'Review' object with extra 'post' meta if we wanted minimal frontend change.
    // However, Hybrid model implies we treat them as Posts. 
    // Let's return raw Posts and update frontend to handle `post.review.content` etc.

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
