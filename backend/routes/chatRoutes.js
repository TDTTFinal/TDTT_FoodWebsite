const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get messages between two users
router.get("/:receiverId", async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.query.senderId; // Pass senderId as query param or get from auth middleware

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
