import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const initializeAuth = async () => {
  //     const token = localStorage.getItem("token");

  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const data = await getCurrentUser();
  //       setUser(data);
  //     } catch (error) {
  //       console.error("Failed to load user:", error);
  //       localStorage.removeItem("token");
  //       setUser(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   initializeAuth();
  // }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      // ← Add this check
      if (!token || !token.startsWith("ey")) {
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
