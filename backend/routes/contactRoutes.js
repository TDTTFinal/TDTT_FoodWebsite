const express = require("express");
const {
  submitContact,
  getAllContacts,
} = require("../controllers/contactController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// User gửi form từ trang About
router.post("/about/contact", submitContact);

// Admin xem danh sách liên hệ
router.get("/admin/about/contact", adminAuth, getAllContacts);

module.exports = router;
