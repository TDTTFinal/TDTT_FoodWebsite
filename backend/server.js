// File: TDTT_FoodWebsite/backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const searchRoutes = require("./routes/searchRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const contactRoutes = require("./routes/contactRoutes");
app.use("/api", contactRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
// -> /api/auth/register
// -> /api/auth/login
// -> /api/auth/google

// THÊM ĐOẠN NÀY VÀO ĐÂY
const restaurantRoutes = require("./routes/restaurantRoutes");
app.use("/api/restaurants", restaurantRoutes);
// -> /api/restaurants
// -> /api/restaurants/:id
// -> /api/restaurants/featured
// -> /api/restaurants/categories/stats
// KẾT THÚC ĐOẠN THÊM

// Dish/Food API
const dishRoutes = require("./routes/dishRoutes");
app.use("/api/dishes", dishRoutes);
// -> /api/dishes (GET all dishes with filters)
// -> /api/dishes/:id (GET single dish)
// -> /api/dishes/featured (GET featured dishes)
// -> /api/dishes/categories/stats (GET category stats)

app.use("/api/search", searchRoutes); // dùng cho cả /api/search/advanced

const foodTourRoutes = require("./routes/foodTourRoutes");
app.use("/api/food-tours", foodTourRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// -> /api/users/upload-avatar
// -> /api/users/profile

// Weather API for Food Tour
const weatherRoutes = require("./routes/weatherRoutes");
app.use("/api/weather", weatherRoutes);
// -> /api/weather/forecast
// -> /api/weather/check-slot

// Review API
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);
// -> /api/reviews/restaurant/:id
// -> /api/reviews (POST)
// -> /api/reviews/:id/like
// -> /api/reviews/upload

// History API
const historyRoutes = require("./routes/historyRoutes");
app.use("/api/history", historyRoutes);
// -> /api/history/views (GET/POST/DELETE)
// -> /api/history/reviews (GET)
// -> /api/history/sync (POST)

// Admin API
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
// -> /api/admin/categories (GET/POST/PUT/DELETE)
// -> /api/admin/restaurants (GET)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy port ${PORT}`));
