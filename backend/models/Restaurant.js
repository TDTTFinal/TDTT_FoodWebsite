const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    opening_hours: {
      type: String,
      default: "Đang cập nhật", // Format: "HH:mm - HH:mm"
    },
    price_range: {
      type: String,
      default: "Đang cập nhật",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    menu: {
      type: [menuItemSchema],
      default: [],
    },
    menu_min_price: Number,
    menu_max_price: Number,
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    source_url: {
      type: String,
      default: "",
    },
    // Use avatar_url to match existing data, keep image_url as fallback/alias if needed
    avatar_url: {
      type: String,
      default: "https://placehold.co/400x300/FFF3E0/E65100?text=Restaurant",
    },
    image_url: { type: String }, // Keep for backward compatibility if code uses it
    avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10, // Scale seems to be 10 based on user sample (9.5)
    },
    scores: {
      space: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
    },
    category: {
      type: String,
      default: "Khác", // Can be "Lẩu", "Cơm", etc.
    },
    tags: [String], // New field for flexible tagging (e.g. "Ăn sáng", "Hẹn hò")
  },
  {
    timestamps: true,
    collection: "test",
  }
);

// Index for text search
restaurantSchema.index({ name: "text", address: "text" });

// Index for category and rating
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ avg_rating: -1 });

// Index for Geospatial queries (CRITICAL for "Near Me")
restaurantSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", restaurantSchema);
