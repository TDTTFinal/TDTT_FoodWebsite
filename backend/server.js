const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy port ${PORT}`));

