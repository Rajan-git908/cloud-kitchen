//AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    if (token && !user) {
      axios.get(`${API_BASE_URL}/api/auth/profile`)
        .then((res) => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken("");
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        });
    }
  }, [token, user]);

  const login = async (credentials, passwordArg) => {
    const payload =
      typeof credentials === "object" && credentials !== null
        ? {
            phone: credentials.phone ?? credentials.username,
            password: credentials.password ?? passwordArg,
          }
        : { phone: credentials, password: passwordArg };

    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("token", res.data.token);
    return res.data.user;
  };

  const register = async ({ fullName, phone, location, password }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        full_name: fullName,
        phone,
        location,
        password,
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };


  const logout = async () => {
    try {
      // Call backend logout endpoint to clear server session if needed
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with client-side logout even if backend call fails
    } finally {
      setUser(null);
      setToken("");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, apiBaseUrl: API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
