const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const dotenv = require('dotenv');

dotenv.config(); // Assuming run from backend dir

// CATEGORY RULES
const CATEGORIES = {
  COM: "Cơm & Món Mặn",
  NUOC: "Món Nước & Sợi",
  CAFE: "Cafe & Trà Sữa",
  SNACK: "Ăn Vặt & Bánh",
  PARTY: "Lẩu - Nướng & Nhậu",
  HEALTHY: "Healthy & Khác"
};

// KEYWORD MAPPING (Lower Priority -> Higher Priority override)
const RULES = [
  // 1. CAFE & DRINKS
  { keywords: ["cafe", "coffee", "cà phê", "trà", "tea", "milk tea", "phúc long", "highlands", "katinat", "sinh tố", "nước ép"], category: CATEGORIES.CAFE },
  
  // 2. NOODLES (Món nước)
  { keywords: ["phở", "bún", "hủ tiếu", "mì", "miến", "bánh canh", "nui"], category: CATEGORIES.NUOC },
  
  // 3. SNACK & FAST FOOD
  { keywords: ["bánh mì", "bánh tráng", "pizza", "burger", "gà rán", "kfc", "lotteria", "ăn vặt", "xiên que", "bánh", "kem", "chè"], category: CATEGORIES.SNACK },
  
  // 4. RICE (Cơm)
  { keywords: ["cơm", "cơm tấm", "cơm niêu", "cơm gà", "bếp", "quán ăn", "tiệm ăn"], category: CATEGORIES.COM },
  
  // 5. PARTY (Lẩu/Nướng) - Higher Priority
  { keywords: ["lẩu", "buffet", "bbq", "nướng", "hải sản", "quán nhậu", "bia", "ốc", "kichi", "go gi", "manwah", "king bbq"], category: CATEGORIES.PARTY },

  // 6. HEALTHY - Specific
  { keywords: ["chay", "salad", "healthy", "eat clean", "poke", "thực dưỡng"], category: CATEGORIES.HEALTHY }
];

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const restaurants = await Restaurant.find({});
    console.log(`Found ${restaurants.length} restaurants. Starting migration...`);

    let stats = { updated: 0, skipped: 0, byCategory: {} };

    for (const res of restaurants) {
      let allocatedCategory = CATEGORIES.COM; // Default
      let bestMatchIndex = -1; // Higher index = higher priority

      const text = (res.name + " " + (res.category || "")).toLowerCase();
      // Also check menu items if available? For speed, let's stick to name + current category first.
      
      RULES.forEach((rule, index) => {
        const match = rule.keywords.some(k => text.includes(k));
        if (match) {
            // Only update if this rule has higher priority (defined by index for now, or just last match wins concept)
            // Let's strictly follow the RULES array order: Later rules override earlier ones? 
            // Actually, "Lẩu" (Party) should override "Bún" if Name is "Lẩu Bún"? Probably not.
            // Let's use simple precedence: Lẩu > Cơm > Món Nước > Cafe.
            // Wait, "Cơm thố cháy" -> Cơm. 
            // "Lẩu bò" -> Lẩu.
            // My Rules order above: 
            // Cafe (Low) -> Nuoc -> Snack -> Rice -> Party (High).
            // Example: "Tiệm Trà Sữa & Pizza" -> Matches Cafe & Snack. 
            // If Snack is later in array, it becomes Snack. 
            // Let's adjust order to be logical.
            
            allocatedCategory = rule.category;
        }
      });

      // Update
      res.category = allocatedCategory;
      await res.save({ validateBeforeSave: false });
      
      stats.updated++;
      stats.byCategory[allocatedCategory] = (stats.byCategory[allocatedCategory] || 0) + 1;
      
      if (stats.updated % 50 === 0) process.stdout.write(".");
    }

    console.log("\n\n--- MIGRATION COMPLETED ---");
    console.log("Total Processed:", stats.updated);
    console.table(stats.byCategory);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
