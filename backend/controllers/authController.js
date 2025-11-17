const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const genToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, budget, maxDistanceKm, topTags } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu name/email/password" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      budget,
      maxDistanceKm,
      topTags,
    });

    const token = genToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        budget: user.budget,
        maxDistanceKm: user.maxDistanceKm,
        topTags: user.topTags,
      },
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email/password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }

    const token = genToken(user._id);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        budget: user.budget,
        maxDistanceKm: user.maxDistanceKm,
        topTags: user.topTags,
      },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
