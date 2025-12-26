const mongoose = require('mongoose');
const Review = require('./backend/models/Review');
const Restaurant = require('./backend/models/Restaurant');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const checkLatestReview = async () => {
  await connectDB();
  try {
    const latestReview = await Review.findOne().sort({ createdAt: -1 }).populate('restaurant').populate('user');
    if (latestReview) {
      console.log("Latest Review Found:");
      console.log("ID:", latestReview._id);
      console.log("Restaurant:", latestReview.restaurant ? latestReview.restaurant.name : "N/A");
      console.log("User:", latestReview.user ? latestReview.user.name : "Anonymous");
      console.log("Content:", latestReview.content);
      console.log("Status:", latestReview.status);
      console.log("Is Shared to Feed:", latestReview.isSharedToFeed);
      console.log("Created At:", latestReview.createdAt);
    } else {
        console.log("No reviews found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

checkLatestReview();
