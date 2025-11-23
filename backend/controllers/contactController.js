import ContactMessage from "../models/ContactMessage.js";

// POST /api/about/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, message, subject } = req.body;

    const newMessage = await ContactMessage.create({ name, email, message, subject });

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/about/contact
export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, handled } = req.query;

    // filter object
    let filter = {};
    if (handled !== undefined) filter.handled = handled === "true";

    const contacts = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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
