const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Restaurant = require("./models/Restaurant");

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const restaurants = await Restaurant.find({}).limit(10);
        
        console.log("--- Checking first 10 restaurants ---");
        restaurants.forEach(r => {
            console.log(`Name: ${r.name}`);
            console.log(`Location:`, JSON.stringify(r.location));
            console.log("---");
        });
        
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
