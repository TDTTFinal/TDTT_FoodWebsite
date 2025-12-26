// Check categories in test collection
require('dotenv').config();
const mongoose = require('mongoose');

async function checkCategories() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const db = mongoose.connection.db;
  const testCol = db.collection('test');
  
  // Get all unique categories
  const categories = await testCol.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  
  console.log('\n📊 Categories in test collection:');
  categories.forEach(c => console.log(`  ${c._id}: ${c.count} restaurants`));
  
  // Check a specific category
  const sample = await testCol.findOne({ category: 'Cơm & Món Mặn' });
  console.log('\n🔍 Sample "Cơm & Món Mặn":', sample ? sample.name : 'NOT FOUND');
  
  // Also check lowercase
  const sample2 = await testCol.findOne({ category: { $regex: /cơm/i } });
  console.log('🔍 Sample with "cơm" (regex):', sample2 ? sample2.name : 'NOT FOUND');
  
  await mongoose.disconnect();
}

checkCategories().catch(console.error);
