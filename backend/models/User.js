const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Mật khẩu đã hash (local login).
    // Với user đăng nhập Google, ta có thể lưu chuỗi đặc biệt "GOOGLE_LOGIN"
    // và KHÔNG dùng field này để đăng nhập.
    passwordHash: { type: String, required: true },

    // Ảnh đại diện (lấy từ Google nếu có)
    avatar: { type: String },

    // Provider để biết user này đăng ký kiểu gì
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Lưu UID của Google (decoded.uid)
    googleId: { type: String },

    budget: { type: Number, default: 2 },
    maxDistanceKm: { type: Number, default: 5 },
    topTags: { type: [String], default: [] },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastPasswordResetRequest: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
