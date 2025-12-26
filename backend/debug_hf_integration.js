const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const HF_SEARCH_URL = process.env.HF_SEARCH_URL || "https://nemo-chewz.hf.space/api/v1/search/";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/TDTT_FoodWebsite"; // Fallback if env missing

const Restaurant = require('./models/Restaurant');

async function debugIntegration() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected");

        const q = "bún bò";
        const hfParams = {
            q: q,
            top_k: 5,
            lat: 10.7769,
            lon: 106.7009,
            radius: 0,
            alpha: 0.6,
        };

        console.log(`\n🔍 Calling HF API: ${HF_SEARCH_URL}`);
        console.log("Params:", JSON.stringify(hfParams));

        const start = Date.now();
        const hfResponse = await axios.get(HF_SEARCH_URL, {
            params: hfParams,
            timeout: 10000, 
        });
        
        console.log(`✅ HF Response Status: ${hfResponse.status}`);
        const results = hfResponse.data;
        
        console.log(`📦 DB Returned ${results.length} items`);
        if (results.length > 0) {
            console.log("First item sample:", JSON.stringify(results[0], null, 2));
        } else {
            console.log("❌ No results from HF. Stopping.");
            return;
        }

        // 🔍 EXTRACT IDs
        const ids = results
            .map((r) => r.restaurant_id || r._id || r.id)
            .filter((id) => id);
        
        console.log(`\n🆔 Extracted ${ids.length} IDs`);
        console.log("Sample IDs:", ids.slice(0, 3));

        if (ids.length === 0) {
            console.log("❌ Could not extract any IDs from HF response.");
            return;
        }

        // 🔍 QUERY MONGODB
        console.log(`\n📥 Querying MongoDB for ${ids.length} IDs...`);
        const dbRestaurants = await Restaurant.find({ _id: { $in: ids } }).lean();
        
        console.log(`✅ MongoDB returned ${dbRestaurants.length} matches.`);
        
        const dbMap = new Map(dbRestaurants.map((r) => [r._id.toString(), r]));
        
        // 🔍 CHECK MATCHING
        let matchCount = 0;
        results.forEach((item, index) => {
            const id = item.restaurant_id || item._id || item.id;
            const found = dbMap.has(id);
            if (found) matchCount++;
            if (index < 3) {
                 console.log(`[Item ${index}] ID: ${id} -> Found in DB: ${found}`);
            }
        });

        console.log(`\n📊 Final stats: ${matchCount}/${results.length} items matched in DB.`);

        // 🔍 DEBUG LOCAL DB
        console.log("\n🏥 DIAGNOSING LOCAL DB:");
        const count = await Restaurant.countDocuments();
        console.log(`Total Restaurants in DB: ${count}`);
        
        if (count > 0) {
            const sample = await Restaurant.find().limit(3).select('_id name');
            console.log("Sample Local DB Items:", sample);
        }

        // 🔍 TEST FALLBACK QUERY
        console.log(`\n🧪 Testing Fallback Regex Query for "${q}":`);
        const fallbackResults = await Restaurant.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { address: { $regex: q, $options: "i" } }
            ]
        }).limit(5).select('_id name');
        
        console.log(`Fallback found ${fallbackResults.length} items:`, fallbackResults);

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.response) console.error("API Error data:", error.response.data);
    } finally {
        await mongoose.disconnect();
    }
}

debugIntegration();
