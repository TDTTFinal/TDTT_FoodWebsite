import { useState, useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { X, Send } from "lucide-react";

const ChatWindow = ({ receiver, onClose }) => {
  const { user } = useAuth();
  const { messages, setMessages, sendMessage, socket } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (receiver) {
      // Fetch history
      const fetchMessages = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
          const res = await axios.get(
            `${API_URL}/api/chat/${receiver._id}?senderId=${user._id}`
          );
          setMessages(res.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [receiver, user._id, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(receiver._id, input);
    setInput("");
  };

  if (!receiver) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-2xl rounded-lg flex flex-col border border-gray-200 z-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-3 rounded-t-lg flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
            <img src={receiver.avatar || "https://ui-avatars.com/api/?name=" + receiver.name} 
                 alt={receiver.name} className="w-8 h-8 rounded-full border border-white" />
            <span className="font-semibold">{receiver.name}</span>
        </div>
        <button onClick={onClose} className="hover:bg-orange-600 p-1 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((msg, index) => {
           const isMe = msg.sender === user._id;
           return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] p-2 rounded-lg text-sm shadow-sm ${
                  isMe
                    ? "bg-orange-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t flex gap-2 bg-white rounded-b-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
