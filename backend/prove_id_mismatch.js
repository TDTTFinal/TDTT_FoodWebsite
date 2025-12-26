const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const Restaurant = require('./models/Restaurant');

const HF_SEARCH_URL = process.env.HF_SEARCH_URL || "https://nemo-chewz.hf.space/api/v1/search/";

async function proveMismatch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("1️⃣  Lấy dữ liệu từ Hugging Face (Vector DB)...");
        const hfRes = await axios.get(HF_SEARCH_URL, {
            params: { q: "Bún Bò Bùi Thị Xuân", top_k: 1 }
        });
        
        if (hfRes.data.length === 0) {
            console.log("❌ Không tìm thấy dữ liệu trên HF.");
            return;
        }

        const hfItem = hfRes.data[0];
        const hfID = hfItem.restaurant_id || hfItem._id || hfItem.id;
        const hfName = hfItem.name;

        console.log(`   👉 Quán tìm thấy: "${hfName}"`);
        console.log(`   👉 ID trên Hugging Face: ${hfID}`);

        console.log("\n2️⃣  Tìm quán cùng tên trong MongoDB (Local DB)...");
        const localItem = await Restaurant.findOne({ name: hfName });

        if (localItem) {
            console.log(`   👉 Quán tìm thấy: "${localItem.name}"`);
            console.log(`   👉 ID trên MongoDB:      ${localItem._id.toString()}`);
            
            console.log("\n3️⃣  KẾT LUẬN:");
            if (hfID === localItem._id.toString()) {
                console.log("   ✅ ID KHỚP NHAU.");
            } else {
                console.log("   ❌ ID KHÔNG KHỚP!");
                console.log("   (Đây là lý do code cũ không tìm thấy quán)");
            }
        } else {
            console.log("   ❌ Không tìm thấy quán này trong MongoDB. Dữ liệu hoàn toàn lệch.");
        }

    } catch (err) {
        console.error("Lỗi:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

proveMismatch();
