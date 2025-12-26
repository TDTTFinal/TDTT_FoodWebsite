const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      unique: true, // One post per review
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    // Optional caption separate from review content (future proof)
    caption: {
      type: String,
      maxlength: 1000,
    },
    // Denormalized metrics for sorting feed
    likesCount: {
      type: Number,
      default: 0,
      index: -1, // Sort by popularity
    },
    commentsCount: {
        type: Number,
        default: 0,
    },
    // Status
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "posts",
  }
);

// Indexes
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
