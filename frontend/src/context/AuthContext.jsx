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
            // ✅ Fetch fresh user data from MongoDB
            try {
              const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                  'Authorization': `Bearer ${parsedData.token}`
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                  // Update localStorage with fresh data including avatar
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
                  setUser(newAuth.user);
                  console.log('✅ Fresh user data loaded from MongoDB, avatar:', data.user.avatar);
                } else {
                  // Fallback to localStorage if API fails
                  setUser(parsedData.user);
                }
              } else {
                // If token expired or server error, use localStorage data
                setUser(parsedData.user);
              }
            } catch (apiError) {
              console.warn('⚠️ Failed to fetch fresh user data, using localStorage:', apiError);
              setUser(parsedData.user);
            }
          }
        } catch (error) {
          console.error("Lỗi parse auth:", error);
          localStorage.removeItem("auth");
        }
      }
      setLoading(false);
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