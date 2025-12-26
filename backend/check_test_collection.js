const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const HF_ID_TO_CHECK = "694e23ddac96adb579d85d82"; // ID for "Bún Bò Bùi Thị Xuân" from HF

async function checkTestCollection() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Custom check on 'test' collection.\n");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log("📂 Existing collections:", collectionNames);

        if (!collectionNames.includes('test')) {
            console.log("❌ Collection 'test' NOT found.");
            return;
        }

        console.log("✅ Collection 'test' found. Checking content...");
        
        const testCollection = db.collection('test');
        
        // Check count
        const count = await testCollection.countDocuments();
        console.log(`📊 Total documents in 'test': ${count}`);

        if (count === 0) {
            console.log("⚠️ Collection is empty.");
            return;
        }

        // Check specific ID
        console.log(`🔎 Searching for HF ID: ${HF_ID_TO_CHECK}`);
        let found = await testCollection.findOne({ _id: new mongoose.Types.ObjectId(HF_ID_TO_CHECK) });
        
        if (!found) {
            // Try searching with string ID just in case
            found = await testCollection.findOne({ _id: HF_ID_TO_CHECK });
        }

        if (found) {
            console.log("✅ FOUND MATCH in 'test' collection!");
            console.log("   Name:", found.name);
            console.log("   ID:", found._id);
        } else {
            console.log("❌ Not found in 'test' collection either.");
            
            // Check sample
            const sample = await testCollection.findOne({});
            console.log("   Sample ID from 'test':", sample._id);
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkTestCollection();
