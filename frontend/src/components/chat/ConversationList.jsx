import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";

const ConversationList = ({ onSelectUser, onClose }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  // Mock list of users or fetch from API
  // In a real app, this should fetch users you have chatted with or friends
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch real users from backend
        // We need to pass the token for authentication (managed by axios interceptor usually,
        // or we get it from auth context if needed, but assuming axios is configured or we add header)
        const token = localStorage.getItem("token"); // Or useAuth token if available
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/users`, config);
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-72 h-96 bg-white shadow-2xl rounded-lg flex flex-col border border-gray-200 z-50">
      <div className="bg-orange-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
            <MessageCircle size={18}/> Tin nhắn
        </h3>
        <button onClick={onClose}><X size={18}/></button>
      </div>
      <div className="p-3 overflow-y-auto flex-1">
          <p className="text-xs text-gray-500 mb-2">Chọn người để chat (Demo)</p>
          {users.map(u => (
              <div key={u._id} onClick={() => onSelectUser(u)} 
                   className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer border-b">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {u.name.charAt(0)}
                  </div>
                  <div className="text-sm font-medium">{u.name}</div>
              </div>
          ))}
          

      </div>
    </div>
  );
};

export default ConversationList;
