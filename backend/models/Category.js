const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://placehold.co/400x300/E3F2FD/1976D2?text=Category",
    },
    // Số lượng nhà hàng thuộc category này (có thể tính động)
    restaurantCount: {
      type: Number,
      default: 0,
    },
    // Hiển thị trong menu hay không
    visible: {
      type: Boolean,
      default: true,
    },
    // Thứ tự sắp xếp
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "categories",
  }
);

// Index để tìm kiếm nhanh
categorySchema.index({ name: "text" });

module.exports = mongoose.model("Category", categorySchema);
