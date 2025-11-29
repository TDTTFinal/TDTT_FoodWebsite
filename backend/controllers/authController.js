const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto"); // Thêm thư viện crypto để tạo token ngẫu nhiên
const nodemailer = require("nodemailer");

const genToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

// dùng cho trang forgot-password
// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email });
    // Không lộ thông tin tồn tại hay không (best practice)
    if (!user) {
      return res.status(200).json({
        message:
          "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi.",
      });
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Lưu token + thời gian hết hạn vào user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;

    // Vẫn log ra console để dễ debug khi demo
    console.log("🔗 Password reset link:", resetURL);

    // Gửi email thật bằng nodemailer
    try {
      await transporter.sendMail({
        from: `"Chewz App" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Đặt lại mật khẩu Chewz",
        html: `
          <p>Chào ${user.name || "bạn"},</p>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Chewz.</p>
          <p>Nhấn vào link sau để đặt lại mật khẩu (link có hiệu lực trong 15 phút):</p>
          <p><a href="${resetURL}">${resetURL}</a></p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (mailError) {
      console.error("Error sending reset email:", mailError);
      return res.status(500).json({
        message: "Không gửi được email đặt lại mật khẩu. Vui lòng thử lại sau.",
      });
    }

    return res.status(200).json({
      message:
        "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xử lý quên mật khẩu" });
  }
};

// dùng cho trang reset-password
// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user với token khớp và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // ✅ Hash mật khẩu mới vào passwordHash (vì model dùng passwordHash)
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    user.passwordHash = newPasswordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu" });
  }
};
