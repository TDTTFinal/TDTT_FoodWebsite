import React, { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, UserCheck, Clock, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FriendButton = ({ targetUserId, className = "" }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState("none"); // none, sent, received, friends
  const [loading, setLoading] = useState(false);

  // Check status on mount
  useEffect(() => {
    if (!user || !targetUserId) return;
    
    // In a real app, we should probably pass the full user object or friend list 
    // to avoid fetching status for every single button.
    // For now, let's assume valid props or we can do a quick check if we have the list.
    // But for simplicity/correctness, let's just use the props passed from parent if possible
    // OR we fetch the current user's lists to verify.
    // Optimization: The parent component (SocialPage) should fetch the user's friend/request lists once
    // and pass the status to this button.
    // HOWEVER, to keep this component self-contained for now, I'll rely on parent re-rendering or initial state.
    // WAIT, I should probably expose a way to set initial status.
    // Let's assume the parent checks the lists.
    // ACTUALLY, checking "sentFriendRequests" vs "friends" etc. is best done by parent or context.
    // Let's accept `initialStatus` as prop, or try to determine it if I have the global lists.
  }, [user, targetUserId]);

  // Simplify: The parent should figure out the status
  // But wait, the parent might not have all details for every user in a big list.
  // Let's implement a 'smart' button that can also just take `currentStatus` as a prop.
  // Ideally: <FriendButton user={currentUser} targetId={otherId} />
};

// Revamped approach: simpler component that takes props
const SmartFriendButton = ({ targetUserId, currentStatus, onStatusChange, className = "" }) => {
    // currentStatus: 'none', 'friend', 'sent', 'received'
    const [loading, setLoading] = useState(false);

    const handleAction = async (action) => {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            let res;
            if (action === 'add') {
                res = await axios.post(`${API_URL}/api/users/friend-request/${targetUserId}`, {}, config);
                onStatusChange('sent');
            } else if (action === 'accept') {
                res = await axios.post(`${API_URL}/api/users/friend-accept/${targetUserId}`, {}, config);
                onStatusChange('friend');
            } else if (action === 'reject' || action === 'cancel') {
                 // Reject uses same endpoint as cancel usually, or specific
                 res = await axios.post(`${API_URL}/api/users/friend-reject/${targetUserId}`, {}, config);
                 onStatusChange('none');
            }
        } catch (error) {
            console.error("Friend action error:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === 'friend') {
        return (
            <button className={`flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold ${className}`}>
                <UserCheck size={14} /> Bạn bè
            </button>
        );
    }

    if (currentStatus === 'sent') {
        return (
             <button 
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className={`flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold hover:bg-red-50 hover:text-red-500 ${className}`}>
                {loading ? "..." : <><Clock size={14} /> Đã gửi</>}
            </button>
        );
    }

    if (currentStatus === 'received') {
        return (
            <div className={`flex gap-1 ${className}`}>
                <button 
                    onClick={() => handleAction('accept')}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold hover:bg-blue-600">
                    Chấp nhận
                </button>
                <button 
                    onClick={() => handleAction('reject')}
                    disabled={loading}
                    className="p-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300">
                    <X size={14} />
                </button>
            </div>
        );
    }

    // Default: 'none'
    return (
        <button 
            onClick={() => handleAction('add')}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-xs font-semibold transition-colors ${className}`}>
            {loading ? "..." : <><UserPlus size={14} /> Kết bạn</>}
        </button>
    );
};

export default SmartFriendButton;
