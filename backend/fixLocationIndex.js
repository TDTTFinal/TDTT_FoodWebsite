const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllLocationIssues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testCol = mongoose.connection.db.collection('test');

    // Step 1: Find and fix documents with invalid coordinates (non-finite numbers)
    console.log('🔍 Step 1: Finding documents with potentially invalid coordinates...');
    
    const allDocs = await testCol.find({ 
      'location.coordinates': { $exists: true } 
    }).project({ _id: 1, name: 1, location: 1 }).toArray();

    let fixedCount = 0;
    for (const doc of allDocs) {
      if (doc.location && doc.location.coordinates) {
        const [lng, lat] = doc.location.coordinates;
        
        // Check if coordinates are valid finite numbers in valid range
        const isValid = 
          typeof lng === 'number' && 
          typeof lat === 'number' && 
          isFinite(lng) && 
          isFinite(lat) &&
          lng >= -180 && lng <= 180 &&
          lat >= -90 && lat <= 90 &&
          !(lng === 0 && lat === 0); // [0,0] is in the ocean, likely invalid

        if (!isValid) {
          console.log(`  ❌ Invalid: ${doc.name} -> [${lng}, ${lat}]`);
          
          await testCol.updateOne(
            { _id: doc._id },
            { 
              $set: { 
                location: {
                  type: 'Point',
                  coordinates: [106.6297, 10.8231] // Ho Chi Minh City default
                }
              }
            }
          );
          fixedCount++;
        }
      }
    }

    console.log(`✅ Fixed ${fixedCount} documents with invalid coordinates\n`);

    // Step 2: Try to drop existing 2dsphere index if exists
    console.log('🔧 Step 2: Dropping existing 2dsphere index if any...');
    try {
      await testCol.dropIndex('location_2dsphere');
      console.log('   Dropped existing index');
    } catch (e) {
      console.log('   No existing index to drop');
    }

    // Step 3: Create the 2dsphere index
    console.log('\n🔧 Step 3: Creating 2dsphere index...');
    
    const result = await testCol.createIndex(
      { location: '2dsphere' },
      { 
        name: 'location_2dsphere',
        background: true 
      }
    );
    console.log('✅ Index created successfully:', result);

    // List all indexes
    console.log('\n📋 Current indexes on test collection:');
    const indexes = await testCol.indexes();
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixAllLocationIssues();
