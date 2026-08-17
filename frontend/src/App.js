import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Register from "./components/Register";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Profile from "./components/Profile";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useContext(AuthContext);
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <main className="route-loading">Loading your account...</main>;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === "admin" && location.pathname !== "/profile") {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="app-shell">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/:section" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </Router>


    </div>
  );
}

export default App;
