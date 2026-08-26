import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import "./Css/AuthForms.css";

const FULL_NAME_REGEX = /^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,}){1,3}$/;
const PHONE_REGEX = /^(98|97)\d{8}$/;
/*
const FULL_NAME_REGEX = /^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,})$/;
const PHONE_REGEX = /^(98|97)\d{8}$/;
*/
export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) return "Full name is required.";
    if (!FULL_NAME_REGEX.test(trimmedName)) {
      return "Full name must be like 'Ram Kumar' with 2 words, each 3+ letters, starting with a capital letter.";
    }
    if (!PHONE_REGEX.test(trimmedPhone)) {
      return "Phone must be 10 digits and start with 98 or 97.";
    }
    if (!location.trim()) return "Location is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      await register({ fullName, phone, location, password });
      setLoading(false);
      navigate("/login");
    } catch (err) {
      setLoading(false);
      setError(err?.message || "Registration failed. Try again.");
    }
  };

  return (
    <motion.div 
      className="auth-shell" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      
      <motion.form 
        className="auth-card" 
        onSubmit={handleRegister}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        
      >
        <motion.h2 
          className="auth-title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Create account
        </motion.h2>
        
        {error && (
          <motion.div 
            className="auth-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Full name */}
        <motion.label 
          className="auth-label"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="label-text">Full name</span>
          <motion.input 
            className="auth-input" 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="Your full name" 
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.label>

        {/* Phone */}
        <motion.label 
          className="auth-label"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <span className="label-text">Phone</span>
          <motion.input 
            className="auth-input" 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="10-digit phone" 
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.label>

        {/* Location */}
        <motion.label 
          className="auth-label"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <span className="label-text">Location</span>
          <motion.input 
            className="auth-input" 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            placeholder="City, Area or Address" 
            required
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.label>

        {/* Password */}
        <motion.label 
          className="auth-label password-field"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <span className="label-text">Password</span>
          <div className="password-wrapper">
            <motion.input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? "🙈" : "👁️"}
            </motion.span>
          </div>
        </motion.label>

        {/* Confirm password */}
        <motion.label 
          className="auth-label password-field"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <span className="label-text">Confirm password</span>
          <div className="password-wrapper">
            <motion.input
              className="auth-input"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span 
              className="eye-icon" 
              onClick={() => setShowConfirm(!showConfirm)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {showConfirm ? "🙈" : "👁️"}
            </motion.span>
          </div>
        </motion.label>

        <motion.button 
          className="auth-btn primary" 
          type="submit" 
          disabled={loading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Creating..." : "Create account"}
        </motion.button>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <small>Already have an account?</small>
          <motion.button 
            type="button" 
            className="auth-btn ghost" 
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign in
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
