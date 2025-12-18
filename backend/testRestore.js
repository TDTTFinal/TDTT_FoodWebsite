const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const Review = require("./models/Review");

    // Tìm review có status deleted hoặc reported
    const deletedReviews = await Review.find({ status: "deleted" }).limit(1);
    const reportedReviews = await Review.find({ status: "reported" }).limit(1);

    console.log("\n📊 Reviews with status deleted:", deletedReviews.length);
    console.log("📊 Reviews with status reported:", reportedReviews.length);

    if (deletedReviews.length > 0) {
      const review = deletedReviews[0];
      console.log("\n🔍 Testing restore on deleted review:", review._id);
      console.log("Current status:", review.status);

      // Thử restore
      const updated = await Review.findByIdAndUpdate(
        review._id,
        { status: "active" },
        { new: true }
      );

      console.log("✅ Updated status:", updated.status);
    }

    if (reportedReviews.length > 0) {
      const review = reportedReviews[0];
      console.log("\n🔍 Testing restore on reported review:", review._id);
      console.log("Current status:", review.status);

      // Thử restore
      const updated = await Review.findByIdAndUpdate(
        review._id,
        { status: "active" },
        { new: true }
      );

      console.log("✅ Updated status:", updated.status);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

test();
