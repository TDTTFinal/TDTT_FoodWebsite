const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Restaurant = require("./models/Restaurant");

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const categories = await Restaurant.distinct("category");
        console.log("Distinct Categories:", categories);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
