const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const checkReviewQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    
    // 1. Find the latest review to see who wrote it
    const latestReview = await Review.findOne().sort({ createdAt: -1 });
    const authorId = latestReview ? latestReview.user.toString() : null;
    console.log("Latest Review Author ID:", authorId);

    // 2. Find all users with name "Nguyễn Trường Sơn"
    const users = await User.find({ name: "Nguyễn Trường Sơn" });
    console.log(`Found ${users.length} users named 'Nguyễn Trường Sơn':`);
    
    for (const u of users) {
        const count = await Review.countDocuments({ user: u._id, status: 'active' });
        const isAuthor = u._id.toString() === authorId;
        console.log(`- ID: ${u._id} | Email: ${u.email} | Reviews: ${count} ${isAuthor ? "(AUTHOR)" : ""}`);
    }
    
    // Done

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

checkReviewQuery();
