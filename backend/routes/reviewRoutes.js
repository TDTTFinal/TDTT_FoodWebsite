const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = "reviews") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// ========================
// GET /api/reviews/restaurant/:id - Get reviews for a restaurant
// ========================
router.get("/restaurant/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    // Sort options
    let sortOption = { createdAt: -1 }; // newest
    if (sort === "highest") sortOption = { rating: -1, createdAt: -1 };
    if (sort === "lowest") sortOption = { rating: 1, createdAt: -1 };
    if (sort === "helpful") sortOption = { likesCount: -1, createdAt: -1 };

    const reviews = await Review.find({ 
      restaurant: id,
      status: "active"
    })
      .populate("user", "name avatar_url")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ restaurant: id, status: "active" });

    // Calculate stats
    const stats = await Review.aggregate([
      { $match: { restaurant: require("mongoose").Types.ObjectId(id), status: "active" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          rating10: { $sum: { $cond: [{ $gte: ["$rating", 9] }, 1, 0] } },
          rating8: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 7] }, { $lt: ["$rating", 9] }] }, 1, 0] } },
          rating6: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 5] }, { $lt: ["$rating", 7] }] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 3] }, { $lt: ["$rating", 5] }] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $lt: ["$rating", 3] }, 1, 0] } },
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: stats[0] || { avgRating: 0, totalReviews: 0 },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/reviews/upload - Upload images to Cloudinary
// ========================
router.post("/upload", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No images provided" });
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);

    res.json({ success: true, urls });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/reviews - Create new review
// ========================
router.post("/", async (req, res) => {
  try {
    const { restaurant, userId, title, rating, content, images, tags, visitDate, isAnonymous } = req.body;

    // Validate required fields
    if (!restaurant || !rating || !content) {
      return res.status(400).json({ 
        success: false, 
        error: "Restaurant, rating, and content are required" 
      });
    }

    // Check if restaurant exists
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ success: false, error: "Restaurant not found" });
    }

    // Create review
    const review = new Review({
      restaurant,
      user: userId || null,
      title,
      rating,
      content,
      images: images || [],
      tags: tags || [],
      visitDate: visitDate || null,
      isAnonymous: isAnonymous || false,
    });

    await review.save();

    // Update restaurant avg_rating
    const avgResult = await Review.aggregate([
      { $match: { restaurant: require("mongoose").Types.ObjectId(restaurant), status: "active" } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    
    if (avgResult.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurant, { avg_rating: avgResult[0].avg });
    }

    // Populate user info
    await review.populate("user", "name avatar_url");

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// PUT /api/reviews/:id - Update review
// ========================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rating, content, images, tags, visitDate } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    // Update fields
    if (title !== undefined) review.title = title;
    if (rating !== undefined) review.rating = rating;
    if (content !== undefined) review.content = content;
    if (images !== undefined) review.images = images;
    if (tags !== undefined) review.tags = tags;
    if (visitDate !== undefined) review.visitDate = visitDate;
    review.isEdited = true;

    await review.save();
    await review.populate("user", "name avatar_url");

    // Update restaurant avg_rating
    const avgResult = await Review.aggregate([
      { $match: { restaurant: review.restaurant, status: "active" } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    
    if (avgResult.length > 0) {
      await Restaurant.findByIdAndUpdate(review.restaurant, { avg_rating: avgResult[0].avg });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// DELETE /api/reviews/:id - Delete review
// ========================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    // Soft delete
    review.status = "deleted";
    await review.save();

    // Update restaurant avg_rating
    const avgResult = await Review.aggregate([
      { $match: { restaurant: review.restaurant, status: "active" } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    
    await Restaurant.findByIdAndUpdate(review.restaurant, { 
      avg_rating: avgResult.length > 0 ? avgResult[0].avg : 0 
    });

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/reviews/:id/like - Like/unlike review
// ========================
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    const userObjectId = require("mongoose").Types.ObjectId(userId);
    const likeIndex = review.likes.findIndex(l => l.equals(userObjectId));

    if (likeIndex > -1) {
      // Unlike
      review.likes.splice(likeIndex, 1);
      review.likesCount = Math.max(0, review.likesCount - 1);
    } else {
      // Like
      review.likes.push(userObjectId);
      review.likesCount += 1;
    }

    await review.save();

    res.json({ 
      success: true, 
      liked: likeIndex === -1,
      likesCount: review.likesCount 
    });
  } catch (error) {
    console.error("Like review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/reviews/:id/report - Report review
// ========================
router.post("/:id/report", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: "Review not found" });
    }

    // Check if user already reported
    const alreadyReported = review.reports.some(
      r => r.user && r.user.toString() === userId
    );

    if (alreadyReported) {
      return res.status(400).json({ success: false, error: "Already reported" });
    }

    review.reports.push({
      user: userId || null,
      reason: reason || "Inappropriate content",
    });
    review.reportsCount += 1;

    // Auto-hide if too many reports
    if (review.reportsCount >= 5) {
      review.status = "hidden";
    }

    await review.save();

    res.json({ success: true, message: "Report submitted" });
  } catch (error) {
    console.error("Report review error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
