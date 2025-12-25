import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// Change this to your server URL when deploying
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);

      newSocket.emit("join_room", user._id);

      newSocket.on("receive_message", (message) => {
        setMessages((prev) => [...prev, message]);
        // TODO: Update unread count if message is not from active conversation
      });

      return () => newSocket.close();
    }
  }, [user]);

  const sendMessage = (receiverId, content) => {
    if (socket) {
      socket.emit("send_message", {
        senderId: user._id,
        receiverId,
        content,
      });
      // Optimistically add message
      // setMessages((prev) => [
      //   ...prev,
      //   { sender: user._id, receiver: receiverId, content, createdAt: new Date() },
      // ]);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        messages,
        setMessages,
        sendMessage,
        activeConversation,
        setActiveConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
