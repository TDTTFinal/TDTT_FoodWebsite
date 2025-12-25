const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User'); // Required
const Restaurant = require('./models/Restaurant'); // Required
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_website";

async function createTestReview() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // Find a user and a restaurant
    const user = await User.findOne();
    const restaurant = await Restaurant.findOne();

    if (!user || !restaurant) {
        console.log("Need at least 1 user and 1 restaurant to create a review");
        return;
    }

    const testReview = new Review({
        restaurant: restaurant._id,
        user: user._id,
        title: "Test Review with Image",
        rating: 10,
        content: "Đây là bài viết test xem hình ảnh có hiện không.",
        images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c"],
        tags: ["Món ngon"],
        status: "active"
    });

    await testReview.save();
    console.log("Created test review with image:", testReview._id);

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestReview();
