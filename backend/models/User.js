const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    // field cho gợi ý món ăn
    budget: { type: Number, default: 2 },
    maxDistanceKm: { type: Number, default: 5 },
    topTags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
