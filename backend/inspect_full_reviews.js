const mongoose = require('mongoose');
const Review = require('./models/Review');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_website";

async function inspectReviews() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to: ${MONGO_URI.replace(/:([^:@]{1,})@/, ':****@')}`); // Mask password

    // Get 5 reviews, sorted by newest
    const reviews = await Review.find({}).sort({createdAt: -1}).limit(5).lean();
    
    console.log("--- RAW REVIEW DATA SAMPLE (Top 5) ---");
    reviews.forEach((r, i) => {
        console.log(`\n[${i+1}] Review ID: ${r._id}`);
        console.log(`Title: ${r.title}`);
        console.log(`Images Array (length ${r.images ? r.images.length : 'undefined'}):`, r.images);
        // Print all keys to see if there are other fields
        console.log("All Keys:", Object.keys(r));
        if (r.photos) console.log("Found 'photos' field:", r.photos);
        if (r.img) console.log("Found 'img' field:", r.img);
        if (r.picture) console.log("Found 'picture' field:", r.picture);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

inspectReviews();
