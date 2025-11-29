const express = require("express");
const router = express.Router();

const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

const admin = require("../config/firebaseAdmin"); 
const User = require("../models/User");
const jwt = require("jsonwebtoken");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/google", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Thiếu idToken" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Không lấy được email từ tài khoản Google" });
    }

    // Tìm user theo email
    let user = await User.findOne({ email });

    // Nếu chưa tồn tại -> tạo mới
    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        passwordHash: "GOOGLE_LOGIN", // để pass được required, không dùng để login
        avatar: picture,
        provider: "google",
        googleId: uid,
        // budget, maxDistanceKm, topTags dùng default
      });
    }

    // Tạo token JWT (NHỚ chỉnh payload cho giống cách bạn đang dùng trong authController nếu khác)
    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Trả về giống format FE đang lưu: { token, user }
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        budget: user.budget,
        maxDistanceKm: user.maxDistanceKm,
        topTags: user.topTags,
      },
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    return res.status(401).json({ message: "Token Google không hợp lệ" });
  }
});

module.exports = router;
