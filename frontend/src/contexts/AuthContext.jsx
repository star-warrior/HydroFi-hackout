import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the base URL for your authentication endpoints
const API_URL = "http://localhost:5000/api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Will be true until we check for an existing token

  // This effect runs on app startup to check if the user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Set the authorization header for all future axios requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            // If user data is corrupt, log them out
            logout();
        }
      }
      setLoading(false); // Finished checking, update loading state
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      if (response.data && response.data.token) {
        const { token, user } = response.data;

        // 1. Store token and user in localStorage for session persistence
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // 2. Set the authorization header for subsequent requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 3. Update state
        setUser(user);
        setIsAuthenticated(true);

        return { success: true };
      }
      // Handle cases where response is successful but doesn't contain a token
      return { success: false, message: "Login failed. Invalid server response." };

    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      // Return the error message from the backend, or a generic one
      return { success: false, message: error.response?.data?.message || "Invalid credentials or server error." };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);

      if (response.data && response.data.token) {
        const { token, user } = response.data;
        
        // Same logic as login on successful registration
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(user);
        setIsAuthenticated(true);

        return { success: true };
      }
      return { success: false, message: "Registration failed. Invalid server response." };

    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Registration failed. Please try again." };
    }
  };

  const logout = () => {
    // 1. Clear data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Remove the authorization header from axios
    delete axios.defaults.headers.common["Authorization"];

    // 3. Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = { user, isAuthenticated, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};