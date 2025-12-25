const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/food_website";

async function checkRestaurant() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const id = "6935a0f57b7b226d412552b2";
    const restaurant = await Restaurant.findById(id);

    if (restaurant) {
        console.log("FOUND Restaurant:", restaurant.name);
    } else {
        console.log("NOT FOUND Restaurant with ID:", id);
        
        // Count total restaurants
        const count = await Restaurant.countDocuments();
        console.log("Total restaurants in DB:", count);

        // List 5 random IDs
        const random = await Restaurant.find().limit(5).select('_id name');
        console.log("Sample IDs in DB:", random);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRestaurant();
