const mongoose = require('mongoose');
require('dotenv').config();

async function migrateEmbeddedReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testCol = mongoose.connection.db.collection('test');
    const reviewsCol = mongoose.connection.db.collection('reviews');
    
    // Get all restaurants from test collection
    const restaurants = await testCol.find({ 
      reviews: { $exists: true, $ne: [] } 
    }).toArray();
    
    console.log(`📊 Found ${restaurants.length} restaurants with embedded reviews`);
    
    let totalMigrated = 0;
    let errors = 0;
    
    for (const restaurant of restaurants) {
      const restaurantId = restaurant._id;
      const restaurantName = restaurant.name;
      const embeddedReviews = restaurant.reviews || [];
      
      if (embeddedReviews.length === 0) continue;
      
      console.log(`\n🏪 Processing: ${restaurantName} (${embeddedReviews.length} reviews)`);
      
      for (const embeddedReview of embeddedReviews) {
        try {
          // Check if this review already exists (to avoid duplicates)
          // We'll use a combination of restaurant + user_name + rating + date
          const existingReview = await reviewsCol.findOne({
            restaurant: restaurantId,
            'metadata.source': 'migration',
            'metadata.original_user_name': embeddedReview.user_name || embeddedReview.user,
            rating: embeddedReview.rating
          });
          
          if (existingReview) {
            console.log(`  ⏭️  Skipped duplicate review from ${embeddedReview.user_name || embeddedReview.user}`);
            continue;
          }
          
          // Create new review document
          const newReview = {
            restaurant: restaurantId,
            user: null, // No user account for scraped reviews
            title: embeddedReview.title || null,
            rating: embeddedReview.rating || 5,
            content: embeddedReview.comment || embeddedReview.content || 'Không có nội dung',
            images: embeddedReview.images || [],
            tags: embeddedReview.tags || [],
            visitDate: embeddedReview.date ? new Date(embeddedReview.date) : null,
            likes: [],
            comments: [],
            likesCount: 0,
            isEdited: false,
            isAnonymous: false,
            reports: [],
            reportsCount: 0,
            status: 'active',
            isSharedToFeed: false, // Historical data, not user posts
            // Store original metadata
            metadata: {
              source: 'migration',
              original_user_name: embeddedReview.user_name || embeddedReview.user || 'Anonymous',
              migrated_at: new Date(),
              restaurant_name: restaurantName
            },
            createdAt: embeddedReview.date ? new Date(embeddedReview.date) : new Date(),
            updatedAt: new Date()
          };
          
          await reviewsCol.insertOne(newReview);
          totalMigrated++;
          
          if (totalMigrated % 100 === 0) {
            console.log(`  ✅ Migrated ${totalMigrated} reviews so far...`);
          }
        } catch (error) {
          console.error(`  ❌ Error migrating review: ${error.message}`);
          errors++;
        }
      }
      
      console.log(`  ✅ Done with ${restaurantName}: migrated ${embeddedReviews.length} reviews`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY:');
    console.log(`   Total reviews migrated: ${totalMigrated}`);
    console.log(`   Errors: ${errors}`);
    console.log('='.repeat(60));
    
    // Final count
    const totalReviews = await reviewsCol.countDocuments();
    console.log(`\n✅ Total reviews in collection now: ${totalReviews}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal Error:', err);
    process.exit(1);
  }
}

// Warning message
console.log('⚠️  WARNING: This will migrate all embedded reviews to the reviews collection.');
console.log('⚠️  Embedded reviews will NOT be removed from restaurant documents.');
console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...\n');

setTimeout(() => {
  migrateEmbeddedReviews();
}, 5000);
