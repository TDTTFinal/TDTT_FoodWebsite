const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, 'backend/.env') });
const Restaurant = require('./backend/models/Restaurant');

async function checkName() {
    await mongoose.connect(process.env.MONGO_URI);
    const name = "Bún Bò Bùi Thị Xuân";
    const found = await Restaurant.findOne({ name: name });
    console.log(`Searching for "${name}":`, found ? "FOUND" : "NOT FOUND");
    
    if (!found) {
        console.log("Searching partial match 'Bùi Thị Xuân'...");
        const partial = await Restaurant.find({ name: { $regex: "Bùi Thị Xuân", $options: "i" } });
        console.log("Partial matches:", partial.map(r => r.name));
    }
    
    await mongoose.disconnect();
}
checkName();
