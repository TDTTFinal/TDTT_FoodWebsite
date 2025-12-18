const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Reference to restaurant
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    // Reference to user (nullable for anonymous)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Review content
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Images uploaded to Cloudinary
    images: {
      type: [String],
      default: [],
      validate: [(arr) => arr.length <= 5, "Maximum 5 images allowed"],
    },
    // Quick tags
    tags: {
      type: [String],
      enum: [
        "Món ngon",
        "Phục vụ tốt",
        "Giá ổn",
        "Không gian đẹp",
        "Sạch sẽ",
        "Đông khách",
        "Giao hàng nhanh",
      ],
      default: [],
    },
    // Visit date (optional)
    visitDate: {
      type: Date,
      default: null,
    },
    // Likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Comments
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },
    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    // Anonymous posting
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    // Report tracking
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],
    reportsCount: {
      type: Number,
      default: 0,
    },
    // Status
    status: {
      type: String,
      enum: ["active", "hidden", "deleted", "reported"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

// Indexes for efficient querying
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });

// Virtual for time ago
reviewSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(diff / 2592000000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return `${months} tháng trước`;
});

// Ensure virtuals are included in JSON
reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Review", reviewSchema);
