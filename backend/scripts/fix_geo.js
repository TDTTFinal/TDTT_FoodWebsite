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

const fixGeoData = async () => {
  await connectDB();

  try {
    // 1. Drop existing index if any
    try {
        await Restaurant.collection.dropIndex("location_2dsphere");
        console.log("Dropped old 2dsphere index");
    } catch (e) {
        console.log("No existing 2dsphere index to drop, continuing...");
    }

    // 2. Fix Data FIRST (Critical to avoid Index Error 16755)
    console.log("Fixing data before indexing...");
    const restaurants = await Restaurant.find({});
    let updatedCount = 0;
    
    // Coordinates for HCMC (District 1 center approx)
    const BASE_LAT = 10.7769; 
    const BASE_LON = 106.7009;

    for (const res of restaurants) {
      let isValid = true;
      if (!res.location || res.location.type !== "Point" || !Array.isArray(res.location.coordinates)) {
        isValid = false;
      } else {
        const [lon, lat] = res.location.coordinates;
        // Basic check for valid lat/lon range
        if (typeof lon !== 'number' || typeof lat !== 'number' || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            isValid = false;
        }
        // Check for [0, 0] which is likely default/invalid
        if (lon === 0 && lat === 0) isValid = false;
      }

      if (!isValid) {
        // Generate random offset within ~5km
        const latOffset = (Math.random() - 0.5) * 0.05; 
        const lonOffset = (Math.random() - 0.5) * 0.05;
        
        res.location = {
            type: "Point",
            coordinates: [BASE_LON + lonOffset, BASE_LAT + latOffset] // [lon, lat]
        };
        await res.save({ validateBeforeSave: false });
        updatedCount++;
      }
    }
    console.log(`✅ Fixed data for ${updatedCount} restaurants.`);

    // 3. Create Index AFTER data is clean
    console.log("Creating 2dsphere index...");
    await Restaurant.collection.createIndex({ location: "2dsphere" });
    console.log("✅ Created '2dsphere' index successfully!");

    process.exit(0);
  } catch (err) {
    console.error("Error fixing geo data:", err);
    process.exit(1);
  }
};

fixGeoData();
