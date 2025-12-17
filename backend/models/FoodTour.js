// backend/models/FoodTour.js
const mongoose = require("mongoose");

const foodTourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    // Lưu flexible user state (drag & drop)
    tourItems: {
      type: Object, // { morning: [], lunch: [], ... }
      default: {
        morning: [],
        noon: [],
        afternoon: [],
        evening: [],
        unsorted: []
      }
    },
    totalRestaurants: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodTour", foodTourSchema);
