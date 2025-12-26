const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testCol = mongoose.connection.db.collection('test');
    const reviewsCol = mongoose.connection.db.collection('reviews');

    // Count reviews in separate collection
    const separateReviewsCount = await reviewsCol.countDocuments();
    console.log('📊 REVIEW COUNTS:');
    console.log(`   Separate 'reviews' collection: ${separateReviewsCount} documents\n`);

    // Sample from reviews collection
    const reviewSample = await reviewsCol.findOne({});
    console.log('📝 SAMPLE FROM REVIEWS COLLECTION:');
    console.log(JSON.stringify(reviewSample, null, 2));
    console.log('\n');

    // Count restaurants with embedded reviews
    const restaurantsWithReviews = await testCol.countDocuments({ 
      reviews: { $exists: true, $ne: [] } 
    });
    console.log('📊 EMBEDDED REVIEWS IN RESTAURANTS:');
    console.log(`   ${restaurantsWithReviews} restaurants have embedded reviews\n`);

    // Sample restaurant with reviews
    const restaurantWithReviews = await testCol.findOne(
      { reviews: { $exists: true, $ne: [] } },
      { projection: { name: 1, reviews: 1, avg_rating: 1 } }
    );
    console.log('📝 SAMPLE RESTAURANT WITH EMBEDDED REVIEWS:');
    console.log(`   Name: ${restaurantWithReviews.name}`);
    console.log(`   Avg Rating: ${restaurantWithReviews.avg_rating}`);
    console.log(`   Reviews count: ${restaurantWithReviews.reviews.length}`);
    console.log(`   First review sample:`, JSON.stringify(restaurantWithReviews.reviews[0], null, 2));
    console.log('\n');

    // Total embedded reviews
    const totalEmbeddedReviews = await testCol.aggregate([
      { $unwind: '$reviews' },
      { $count: 'total' }
    ]).toArray();
    
    console.log('📊 TOTAL COUNTS:');
    console.log(`   Total embedded reviews: ${totalEmbeddedReviews[0]?.total || 0}`);
    console.log(`   Total separate reviews: ${separateReviewsCount}`);
    console.log(`   GRAND TOTAL: ${(totalEmbeddedReviews[0]?.total || 0) + separateReviewsCount}\n`);

    // Check if separate reviews reference restaurants
    const reviewWithRestaurant = await reviewsCol.findOne({ restaurant: { $exists: true } });
    console.log('🔗 REVIEW-RESTAURANT RELATIONSHIP:');
    console.log(`   Separate reviews have 'restaurant' field: ${reviewWithRestaurant ? 'YES' : 'NO'}`);
    if (reviewWithRestaurant) {
      console.log(`   Sample restaurant ID: ${reviewWithRestaurant.restaurant}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

analyzeReviews();
