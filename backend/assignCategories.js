// Assign categories to restaurants based on name/menu keywords
require('dotenv').config();
const mongoose = require('mongoose');

// Category mapping rules based on keywords
const categoryRules = [
  {
    category: 'Cafe & Trà Sữa',
    keywords: ['cafe', 'coffee', 'cà phê', 'trà sữa', 'tea', 'milk tea', 'boba', 'highlands', 'starbucks', 'phúc long', 'the coffee', 'trà đào', 'trà chanh', 'nước ép']
  },
  {
    category: 'Cơm & Món Mặn',
    keywords: ['cơm', 'com tam', 'cơm tấm', 'cơm gà', 'cơm sườn', 'cơm văn phòng', 'cơm bình dân', 'cơm niêu', 'gà rán', 'gà nướng', 'thịt kho', 'cá kho', 'món mặn']
  },
  {
    category: 'Món Nước & Sợi',
    keywords: ['phở', 'bún', 'bun bo', 'bún bò', 'bún riêu', 'bún chả', 'mì', 'hủ tiếu', 'miến', 'bánh canh', 'soup', 'noodle', 'bún đậu', 'bún mắm', 'bún thịt']
  },
  {
    category: 'Ăn Vặt & Bánh',
    keywords: ['bánh mì', 'bánh tráng', 'bánh', 'xôi', 'chè', 'kem', 'pizza', 'burger', 'snack', 'ăn vặt', 'gỏi cuốn', 'nem', 'chả giò', 'bánh cuốn', 'bánh xèo', 'bánh khọt']
  },
  {
    category: 'Lẩu - Nướng & Nhậu',
    keywords: ['lẩu', 'nướng', 'bbq', 'buffet', 'beer', 'bia', 'nhậu', 'hải sản', 'hàu', 'tôm', 'cua', 'ốc', 'sò', 'quán nhậu', 'hotpot', 'hấp', 'xiên que', 'thịt nướng']
  },
  {
    category: 'Healthy & Khác',
    keywords: ['salad', 'healthy', 'chay', 'vegetarian', 'vegan', 'organic', 'diet', 'ngũ cốc', 'sinh tố', 'smoothie', 'juice']
  }
];

function determineCategory(restaurant) {
  const name = (restaurant.name || '').toLowerCase();
  const menuItems = (restaurant.menu || []).map(m => (m.name || '').toLowerCase()).join(' ');
  const address = (restaurant.address || '').toLowerCase();
  const searchText = `${name} ${menuItems}`;
  
  for (const rule of categoryRules) {
    for (const keyword of rule.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }
  
  // Default category based on common patterns
  if (name.includes('quán') || name.includes('nhà hàng')) {
    return 'Cơm & Món Mặn';
  }
  
  return 'Healthy & Khác'; // Fallback
}

async function assignCategories() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  
  const db = mongoose.connection.db;
  const testCol = db.collection('test');
  
  // Get all restaurants with null or missing category
  const restaurants = await testCol.find({
    $or: [
      { category: null },
      { category: { $exists: false } },
      { category: '' }
    ]
  }).toArray();
  
  console.log(`\n📍 Found ${restaurants.length} restaurants without proper category\n`);
  
  const categoryStats = {};
  let updatedCount = 0;
  
  for (const r of restaurants) {
    const newCategory = determineCategory(r);
    categoryStats[newCategory] = (categoryStats[newCategory] || 0) + 1;
    
    // Update in database
    await testCol.updateOne(
      { _id: r._id },
      { $set: { category: newCategory } }
    );
    updatedCount++;
    
    if (updatedCount % 100 === 0) {
      console.log(`  Updated ${updatedCount}/${restaurants.length}...`);
    }
  }
  
  console.log(`\n✅ Updated ${updatedCount} restaurants`);
  console.log('\n📊 Category distribution:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
  
  await mongoose.disconnect();
}

assignCategories().catch(console.error);
