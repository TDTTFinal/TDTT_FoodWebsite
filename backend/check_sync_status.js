const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const Restaurant = require('./models/Restaurant');

const HF_SEARCH_URL = process.env.HF_SEARCH_URL || "https://nemo-chewz.hf.space/api/v1/search/";

async function checkSyncStatus() {
    try {
        console.log("🔌 Đang kết nối MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected.\n");

        const queries = ["bún bò", "cơm tấm", "phở", "trà sữa"];
        let totalChecked = 0;
        let idMatches = 0;
        let nameMatches = 0; // ID mismatch but Name match
        let missing = 0;

        console.log("🔍 Đang kiểm tra đồng bộ dữ liệu (Sample Check)...");
        console.log("==================================================");

        for (const q of queries) {
            console.log(`\n📡 Query HF: "${q}"...`);
            try {
                const hfRes = await axios.get(HF_SEARCH_URL, {
                    params: { q, top_k: 5 } // Check top 5 for each query
                });
                
                const items = hfRes.data;
                if (!Array.isArray(items) || items.length === 0) continue;

                for (const item of items) {
                    totalChecked++;
                    const hfID = item.restaurant_id || item._id || item.id;
                    const hfName = item.name;

                    // 1. Check ID Match
                    const idMatch = await Restaurant.findById(hfID);
                    if (idMatch) {
                        console.log(`  ✅ [OK] ID khớp: "${hfName}"`);
                        idMatches++;
                        continue;
                    }

                    // 2. Check Name Match (Fallback)
                    const nameMatch = await Restaurant.findOne({ name: hfName });
                    if (nameMatch) {
                        console.log(`  ⚠️ [LỆCH ID] Tên khớp: "${hfName}"`);
                        console.log(`     - HF ID: ${hfID}`);
                        console.log(`     - DB ID: ${nameMatch._id}`);
                        nameMatches++;
                    } else {
                        console.log(`  ❌ [MISSING] Không thấy trong DB: "${hfName}" (ID: ${hfID})`);
                        missing++;
                    }
                }
            } catch (err) {
                console.error(`  Lỗi query "${q}":`, err.message);
            }
        }

        console.log("\n==================================================");
        console.log("📊 KẾT QUẢ KIỂM TRA ĐỒNG BỘ:");
        console.log(`Tổng số mẫu kiểm tra: ${totalChecked}`);
        console.log(`✅ ID Khớp hoàn toàn: ${idMatches} (${((idMatches/totalChecked)*100).toFixed(1)}%)`);
        console.log(`⚠️ Lệch ID (Sửa bằng tên): ${nameMatches} (${((nameMatches/totalChecked)*100).toFixed(1)}%)`);
        console.log(`❌ Dữ liệu không tồn tại: ${missing} (${((missing/totalChecked)*100).toFixed(1)}%)`);
        console.log("==================================================");
        
        if (nameMatches > 0) {
            console.log("\n💡 KẾT LUẬN: Hệ thống đang bị lệch ID nhưng vẫn tìm thấy nhau qua Tên.");
            console.log("   Code hiện tại ĐÃ XỬ LÝ được trường hợp này -> Web chạy OK.");
        }

    } catch (err) {
        console.error("Critical Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSyncStatus();
