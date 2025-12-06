const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const genToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_CHEWZ,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ POST /api/auth/register - Đã được cải thiện
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      budget,
      maxDistanceKm,
      topTags,
    } = req.body;

    // ✅ Validation chi tiết hơn
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
        details: {
          name: !name ? "Họ tên là bắt buộc" : null,
          email: !email ? "Email là bắt buộc" : null,
          password: !password ? "Mật khẩu là bắt buộc" : null,
        },
      });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // ✅ Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // ✅ Kiểm tra email đã tồn tại
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        message:
          "Email đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
      });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ✅ Tạo user mới với default values
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      budget: budget || null,
      maxDistanceKm: maxDistanceKm || null,
      topTags: topTags || [],
    });

    // ✅ Generate JWT token
    const token = genToken(user._id);

    // ✅ Log để debug (chỉ trong development)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ User registered successfully:", {
        id: user._id,
        email: user.email,
        name: user.name,
      });
    }

    // ✅ Trả về response
    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        budget: user.budget,
        maxDistanceKm: user.maxDistanceKm,
        topTags: user.topTags,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Register error:", err);

    // ✅ Xử lý các loại lỗi cụ thể
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        details: err.message,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email đã tồn tại",
      });
    }

    res.status(500).json({
      message: "Lỗi server khi đăng ký",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ✅ POST /api/auth/login - Đã được cải thiện
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ email và mật khẩu",
      });
    }

    // ✅ Tìm user (case-insensitive email)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // ✅ Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // ✅ Generate token
    const token = genToken(user._id);

    // ✅ Log để debug (chỉ trong development)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ User logged in:", {
        id: user._id,
        email: user.email,
      });
    }

    // ✅ Trả về response
    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        budget: user.budget,
        maxDistanceKm: user.maxDistanceKm,
        topTags: user.topTags,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({
      message: "Lỗi server khi đăng nhập",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // ✅ Không lộ thông tin tồn tại hay không (best practice)
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

    // Log ra console để dễ debug khi demo
    console.log("🔗 Password reset link:", resetURL);

    // Gửi email thật bằng nodemailer
    try {
      await transporter.sendMail({
        from: `"Chewz App" <${process.env.EMAIL_CHEWZ}>`,
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

      console.log("✅ Reset email sent to:", user.email);
    } catch (mailError) {
      console.error("❌ Error sending reset email:", mailError);
      return res.status(500).json({
        message: "Không gửi được email đặt lại mật khẩu. Vui lòng thử lại sau.",
      });
    }

    return res.status(200).json({
      message:
        "Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi xử lý quên mật khẩu" });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });
    }

    // ✅ Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
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

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(password, salt);

    user.passwordHash = newPasswordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("✅ Password reset successful for:", user.email);

    return res.json({
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu" });
  }
};
