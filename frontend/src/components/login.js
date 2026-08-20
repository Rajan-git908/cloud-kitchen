import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import "./AuthForms.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\+?\d{7,15}$/.test(phone)) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      // Pass an object to login; adapt if your AuthContext expects different args
      const loggedInUser = await login({ phone, password });
      setLoading(false);
      navigate(loggedInUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || (err.code === "ERR_NETWORK"
        ? "Cannot reach the server. Start the backend on port 5000 and try again."
        : err?.message || "Login failed. Check credentials."));
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
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2
          className="auth-title"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Welcome back
        </motion.h2>

        {error && (
          <motion.div
            className="auth-error"
            role="alert"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <motion.label
          className="auth-label"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="label-text">Phone</span>
          <motion.input
            className="auth-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXXX (Must be 10 digit)" 
            pattern="\+?\d{7,15}"
            required
            autoComplete="tel"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </motion.label>


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






        <motion.button
          className="auth-btn primary"
          type="submit"
          disabled={loading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </motion.button>

        <motion.div
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <small>New here?</small>
          <motion.button
            type="button"
            className="auth-btn ghost"
            onClick={() => navigate("/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create account
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
