import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const parsedData = JSON.parse(storedAuth);
        if (parsedData.user && parsedData.token) {
          setUser(parsedData.user);
        }
      } catch (error) {
        console.error("Lỗi parse auth:", error);
        localStorage.removeItem("auth");
      }
    }
    setLoading(false);
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