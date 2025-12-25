import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const parsedData = JSON.parse(storedAuth);
          if (parsedData.user && parsedData.token) {
            // OPTIMISTIC UPDATE: Set user immediately from local storage to show UI
            setUser(parsedData.user);
            setLoading(false); // Unblock render immediately

            // Background fetch to ensure fresh data
            try {
              const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                  'Authorization': `Bearer ${parsedData.token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  const newAuth = {
                    user: {
                      ...parsedData.user,
                      ...data.user,
                      _id: data.user._id || parsedData.user.id || parsedData.user._id,
                      id: data.user._id || parsedData.user.id || parsedData.user._id
                    },
                    token: parsedData.token
                  };
                  localStorage.setItem("auth", JSON.stringify(newAuth));
                  setUser(newAuth.user); // Update with fresh data
                  console.log('Fresh user data loaded from MongoDB (Background)');
                }
              }
            } catch (apiError) {
              console.warn('Background profile fetch failed, using local data:', apiError);
            }
            return; // Exit since we handled loading inside
          }
        } catch (error) {
          console.error("Lỗi parse auth:", error);
          localStorage.removeItem("auth");
        }
      }
      setLoading(false); // No user found or error, stop loading
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("auth", JSON.stringify({ user: userData, token }));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (updatedUserData) => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const parsedData = JSON.parse(storedAuth);
        const newUserData = { ...parsedData.user, ...updatedUserData };
        localStorage.setItem("auth", JSON.stringify({ user: newUserData, token: parsedData.token }));
        setUser(newUserData);
      } catch (error) {
        console.error("Lỗi update user:", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};