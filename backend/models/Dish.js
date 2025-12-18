const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: "Khác", // "Món chính", "Khai vị", "Tráng miệng", "Đồ uống", etc.
    },
    image_url: {
      type: String,
      default: "https://placehold.co/400x300/FFF3E0/E65100?text=Dish",
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false, // Có thể null nếu món ăn chung chung
    },
    tags: {
      type: [String],
      default: [], // ["Cay", "Chay", "Halal", "Healthy", etc.]
    },
    avg_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    calories: {
      type: Number,
      default: 0, // Kcal
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    cuisine_type: {
      type: String,
      default: "Việt Nam", // "Việt Nam", "Nhật Bản", "Hàn Quốc", "Thái Lan", etc.
    },
  },
  {
    timestamps: true,
    collection: "dishes",
  }
);

// Index cho text search
dishSchema.index({ name: "text", description: "text" });

// Index cho category và rating
dishSchema.index({ category: 1 });
dishSchema.index({ avg_rating: -1 });
dishSchema.index({ restaurant: 1 });

module.exports = mongoose.model("Dish", dishSchema);
