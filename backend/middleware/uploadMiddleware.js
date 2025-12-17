const multer = require('multer');

// Lưu file vào memory (RAM) thay vì disk
const storage = multer.memoryStorage();

// File filter: chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)'), false);
  }
};

// Export multer với config
const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = { upload };
