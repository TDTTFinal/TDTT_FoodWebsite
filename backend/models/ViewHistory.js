const mongoose = require("mongoose");

const viewHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "viewhistories",
  }
);

// Compound index for efficient querying and preventing duplicates
viewHistorySchema.index({ user: 1, restaurant: 1 }, { unique: true });
// Index for sorting by view time
viewHistorySchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model("ViewHistory", viewHistorySchema);
