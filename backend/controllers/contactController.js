const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_CHEWZ,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/about/contact
exports.submitContact = async (req, res) => {
  console.log("Contact API hit! Body:", req.body);

  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message || !subject) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin liên hệ" });
    }

    // 1. Lưu vào MongoDB để sau này xem trong trang admin
    const newMessage = await ContactMessage.create({
      name,
      email,
      message,
      subject,
    });

    // 2. Gửi mail về cho bạn
    const ownerEmail = process.env.EMAIL_CHEWZ || process.env.EMAIL_CHEWZ;

    await transporter.sendMail({
      from: `"Chewz Contact" <${process.env.EMAIL_CHEWZ}>`,
      to: ownerEmail,
      replyTo: email,
      subject: `[Chewz Contact] ${subject}`,
      html: `
        <h3>📩 Liên hệ mới từ Chewz</h3>
        <p><strong>Họ tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Chủ đề:</strong> ${subject}</p>
        <p><strong>Nội dung:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send contact error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi gửi liên hệ" });
  }
};

// GET /api/admin/about/contact  (để sau dùng cho trang admin)
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, handled } = req.query;

    const filter = {};
    if (handled === "true") filter.handled = true;
    if (handled === "false") filter.handled = false;

    const contacts = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await ContactMessage.countDocuments(filter);

    res.json({
      success: true,
      page: Number(page),
      total,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
