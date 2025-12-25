const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User'); 
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_website";

async function checkReviews() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const totalReviews = await Review.countDocuments();
    console.log(`Total Reviews: ${totalReviews}`);

    const reviewsWithImages = await Review.find({ images: { $ne: [] } }).select('status title createdAt images content');
    console.log(`Reviews with images: ${reviewsWithImages.length}`);
    
    reviewsWithImages.forEach(r => {
        console.log(`- [${r.status}] ${r.title || r.content.substring(0,20)} (${r.images.length} images) - ${r.createdAt}`);
    });

    const activeReviews = await Review.countDocuments({ status: 'active' });
    console.log(`Active Reviews: ${activeReviews}`);

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkReviews();
