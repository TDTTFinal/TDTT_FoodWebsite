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
      default: "Đang cập nhật",
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
        type: [Number],
        default: [0, 0],
      },
    },
    menu: {
      type: [menuItemSchema],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    source_url: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: "https://placehold.co/400x300/FFF3E0/E65100?text=Restaurant",
    },
    avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    scores: {
      space: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
    },
    // Thêm field category để phân loại
    category: {
      type: String,
      enum: [
        "Tất cả",
        "Lẩu",
        "BBQ",
        "Cơm",
        "Phở",
        "Bún",
        "Trà sữa",
        "Cafe",
        "Hải sản",
        "Buffet",
        "Khác",
      ],
      default: "Khác",
    },
  },
  {
    timestamps: true,
    collection: "restaurants", // Tên collection trong MongoDB
  }
);

// Index để tìm kiếm nhanh
restaurantSchema.index({ name: "text", address: "text" });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ avg_rating: -1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);
