
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster0.mq0kw.mongodb.net/TDTT?retryWrites=true&w=majority";

async function verifyId() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");
        
        // ID from the user's provided list
        const testId = "694e23d5ac96adb579d85a25"; 
        
        console.log(`Searching for ID: ${testId} in collection '${Restaurant.collection.name}'`);
        
        const restaurant = await Restaurant.findById(testId);
        
        if (restaurant) {
            console.log("✅ FOUND Restaurant:");
            console.log(restaurant.name);
            console.log(restaurant._id);
        } else {
            console.log("❌ NOT FOUND");
            
            // Try searching by name to see if it exists with a different ID
            const byName = await Restaurant.findOne({ name: "Phở Tân Phú" });
            if (byName) {
                console.log(`⚠️ Found 'Phở Tân Phú' but with ID: ${byName._id}`);
            } else {
                console.log("❌ 'Phở Tân Phú' also not found by name.");
            }
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyId();
