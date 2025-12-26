const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Review = require("../models/Review");
const Post = require("../models/Post");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const migratePosts = async () => {
  await connectDB();

  try {
    console.log("Starting Post migration...");

    // 1. Clear existing posts (optional, but good for clean slate during dev)
    await Post.deleteMany({});
    console.log("Cleared existing posts.");

    // 2. Find high quality reviews
    // Criteria: Rating >= 8 AND (Has Images OR Content > 50 chars) AND NOT Anonymous
    const reviews = await Review.find({
        rating: { $gte: 8 },
        isAnonymous: false,
        status: "active"
    });

    console.log(`Found ${reviews.length} candidate reviews (Rating >= 8). Filtering for quality...`);

    let count = 0;
    for (const review of reviews) {
        const hasImages = review.images && review.images.length > 0;
        const hasContent = review.content && review.content.length > 50;

        if (hasImages || hasContent) {
            // Check if post already exists (redundant due to deleteMany but good for safety)
            const exists = await Post.findOne({ review: review._id });
            if (!exists) {
                await Post.create({
                    review: review._id,
                    user: review.user,
                    restaurant: review.restaurant,
                    likesCount: review.likesCount || 0,
                    status: "active",
                    createdAt: review.createdAt // Preserve timeline
                });
                
                // Update the review flag
                review.isSharedToFeed = true;
                await review.save();
                
                count++;
                if (count % 50 === 0) process.stdout.write(".");
            }
        }
    }

    console.log(`\n✅ Successfully created ${count} Posts from high-quality reviews.`);
    process.exit(0);

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
};

migratePosts();
