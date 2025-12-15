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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
            .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; }
            .header { background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
            .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 40px 30px; }
            .info-item { margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; }
            .info-item:last-child { border-bottom: none; }
            .label { font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; font-weight: 600; margin-bottom: 5px; display: block; }
            .value { font-size: 16px; font-weight: 500; color: #1a1a1a; word-break: break-word; }
            .message-box { background-color: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; border-radius: 4px; margin-top: 10px; font-style: italic; color: #555; }
            .footer { background-color: #f1f3f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; }
            .highlight { color: #FF6B35; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CHEWZ SUPPORT</h1>
              <p>Hệ thống liên hệ & chăm sóc khách hàng</p>
            </div>
            <div class="content">
              <div class="info-item">
                <span class="label">Người gửi</span>
                <div class="value">${name} <span style="color:#ccc; font-weight:normal;">(${email})</span></div>
              </div>
              
              <div class="info-item">
                <span class="label">Chủ đề</span>
                <div class="value highlight">${subject}</div>
              </div>
              
              <div class="info-item" style="border-bottom: none;">
                <span class="label">Nội dung tin nhắn</span>
                <div class="message-box">
                  "${message.replace(/\n/g, "<br/>")}"
                </div>
              </div>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động từ hệ thống website Chewz.</p>
              <p>&copy; ${new Date().getFullYear()} Chewz Corporation. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
