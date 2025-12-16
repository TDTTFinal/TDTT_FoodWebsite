const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const dotenv = require('dotenv');

dotenv.config();

const stopwords = [
  'quán', 'nhà', 'hàng', 'tiệm', 'ăn', 'uống', 'và', 'của', 'the', 'food', 'drink', 'vietnam', 'việt', 
  'nam', 'chi nhánh', 'cs', 'tại', 'ở', 'món', 'ngon', 'đặc', 'sản', 'gia', 'truyền', 'gốc', 'số', 'quận'
];

async function analyzeKeywords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const restaurants = await Restaurant.find({}, 'name menu.name category');
    console.log(`Analyzing ${restaurants.length} restaurants...`);

    const wordCounts = {};
    const categoryCounts = {};

    restaurants.forEach(res => {
      // 1. Analyze Existing Categories
      const currentCat = res.category || 'Uncategorized';
      categoryCounts[currentCat] = (categoryCounts[currentCat] || 0) + 1;

      // 2. Tokenize Name
      const nameTokens = res.name.toLowerCase().split(/\s+/);
      
      // 3. Tokenize Menu Items (Sample first 5 items to avoid bias)
      const menuTokens = res.menu.slice(0, 5).flatMap(item => 
        (item.name || "").toLowerCase().split(/\s+/)
      );

      [...nameTokens, ...menuTokens].forEach(token => {
        // Clean token
        const cleanToken = token.replace(/[^\w\sàáạãảâầấậẫẩăằắặẵẳèéẹẽẻêềếệễểìíịĩỉòóọõỏôồốộỗổơờớợỡởùúụũủưừứựữửỳýỵỹỷđ]/g, "");
        
        if (cleanToken.length > 2 && !stopwords.includes(cleanToken)) {
           wordCounts[cleanToken] = (wordCounts[cleanToken] || 0) + 1;
        }
      });
    });

    // Sort and Top 50
    const sortedKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50);

    console.log("\n--- THỐNG KÊ DANH MỤC HIỆN TẠI ---");
    console.table(categoryCounts);

    console.log("\n--- TOP 50 TỪ KHÓA PHỔ BIẾN (Tên & Menu) ---");
    console.log("Từ khóa | Số lần xuất hiện");
    sortedKeywords.forEach(([word, count]) => {
      console.log(`${word.padEnd(15)} | ${count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

analyzeKeywords();
