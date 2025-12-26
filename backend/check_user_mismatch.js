const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const checkUserMismatch = async () => {
  await connectDB();
  try {
    const latestReview = await Review.findOne().sort({ createdAt: -1 });
    if (!latestReview) {
      console.log("No reviews found.");
      return;
    }

    console.log("Latest Review ID:", latestReview._id);
    console.log("Review User ID (raw):", latestReview.user);

    if (latestReview.user) {
        const user = await User.findById(latestReview.user);
        if (user) {
            console.log("User found in DB:", user.name, user.email, user._id);
        } else {
            console.log("❌ User ID NOT found in User collection!");
        }
    } else {
        console.log("Review has no user (Anonymous?)");
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

checkUserMismatch();
