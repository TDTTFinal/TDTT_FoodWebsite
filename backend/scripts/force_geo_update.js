const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Restaurant = require("../models/Restaurant");

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

const forceFixGeoData = async () => {
  await connectDB();

  try {
    console.log("FORCING update of ALL restaurant locations to HCM center...");
    const restaurants = await Restaurant.find({});
    
    // Coordinates for HCMC (District 1 center approx)
    const BASE_LAT = 10.7769; 
    const BASE_LON = 106.7009;

    let count = 0;
    for (const res of restaurants) {
        // Generate random offset within ~5km (0.05 degrees approx 5.5km)
        // Make sure it's somewhat distributed but definitely within range
        const latOffset = (Math.random() - 0.5) * 0.04; 
        const lonOffset = (Math.random() - 0.5) * 0.04;
        
        res.location = {
            type: "Point",
            coordinates: [BASE_LON + lonOffset, BASE_LAT + latOffset] // [lon, lat]
        };
        await res.save({ validateBeforeSave: false });
        count++;
        if (count % 100 === 0) process.stdout.write(".");
    }
    console.log(`\n✅ FORCED update for ${count} restaurants.`);

    process.exit(0);
  } catch (err) {
    console.error("Error fixing geo data:", err);
    process.exit(1);
  }
};

forceFixGeoData();
