const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testCol = mongoose.connection.db.collection('test');
    const restaurantCol = mongoose.connection.db.collection('restaurants');

    // Get counts
    const testCount = await testCol.countDocuments();
    const restaurantCount = await restaurantCol.countDocuments();

    console.log('📊 COLLECTION COUNTS:');
    console.log(`   test: ${testCount} documents`);
    console.log(`   restaurants: ${restaurantCount} documents\n`);

    // Get sample from test (without embedding)
    const testSample = await testCol.findOne({}, { projection: { embedding: 0 } });
    console.log('📝 TEST COLLECTION SAMPLE (without embedding):');
    console.log(JSON.stringify(testSample, null, 2));
    console.log('\n');

    // Get sample from restaurants (without embedding)
    const restaurantSample = await restaurantCol.findOne({}, { projection: { embedding: 0 } });
    console.log('📝 RESTAURANTS COLLECTION SAMPLE (without embedding):');
    console.log(JSON.stringify(restaurantSample, null, 2));
    console.log('\n');

    // Check which has more recent updates
    const testLatest = await testCol.findOne({}, { sort: { updatedAt: -1 }, projection: { name: 1, updatedAt: 1 } });
    const restaurantLatest = await restaurantCol.findOne({}, { sort: { updatedAt: -1 }, projection: { name: 1, updatedAt: 1 } });

    console.log('⏰ LATEST UPDATES:');
    console.log('   test:', testLatest);
    console.log('   restaurants:', restaurantLatest);
    console.log('\n');

    // Check if test has embedding field
    const testWithEmbedding = await testCol.countDocuments({ embedding: { $exists: true } });
    const restaurantWithEmbedding = await restaurantCol.countDocuments({ embedding: { $exists: true } });

    console.log('🤖 EMBEDDING FIELD:');
    console.log(`   test: ${testWithEmbedding} docs have embedding`);
    console.log(`   restaurants: ${restaurantWithEmbedding} docs have embedding`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

analyzeCollections();
