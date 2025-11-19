const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware kiểm tra JWT, gắn req.user
// dùng cho các route cần đăng nhập (recommend, planner,...)
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // lấy token từ header Authorization: Bearer xxx
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Không có token, vui lòng đăng nhập" });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User không tồn tại" });
    }

    // gắn user vào request để route phía sau dùng
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    } else {
      return res.status(500).json({ message: "Lỗi xác thực" });
    }
  }
};

module.exports = authMiddleware;

