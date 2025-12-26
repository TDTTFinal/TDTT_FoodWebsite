const mongoose = require('mongoose');
require('dotenv').config();

async function createGeoIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testCol = mongoose.connection.db.collection('test');

    // Create 2dsphere index on location field
    console.log('🔧 Creating 2dsphere index on "location" field...');
    
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
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createGeoIndex();
