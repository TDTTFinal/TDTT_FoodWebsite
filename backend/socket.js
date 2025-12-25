const socketIo = require("socket.io");
const Message = require("./models/Message");

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins for simplicity, in production restrict this
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join room based on userId (to receive private messages)
    socket.on("join_room", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    // Handle sending message
    socket.on("send_message", async (data) => {
      // data: { senderId, receiverId, content }
      try {
        const { senderId, receiverId, content } = data;

        // Save to database
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          isRead: false,
        });
        await newMessage.save();

        // Emit to receiver's room
        io.to(receiverId).emit("receive_message", newMessage);

        // Emit back to sender (to confirm sent and update UI immediately if needed)
        // or just let frontend handle optimistic UI.
        // But better to emit to sender as well if they have multiple tabs open.
        io.to(senderId).emit("receive_message", newMessage);

        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIo };
