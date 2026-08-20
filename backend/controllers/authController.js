//authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../models/db.js";

const FULL_NAME_REGEX = /^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,}){1,3}$/;
const PHONE_REGEX = /^(98|97)\d{8}$/;

export const registerUser = (req, res) => {
  const { full_name, phone, location, password } = req.body || {};

  if (!full_name || !phone || !location || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!FULL_NAME_REGEX.test(String(full_name).trim())) {
    return res.status(400).json({ error: "Full name must be like 'Ram Kumar' with 2 words, each 3+ letters, starting with a capital letter." });
  }

  if (!PHONE_REGEX.test(String(phone).trim())) {
    return res.status(400).json({ error: "Phone must be 10 digits and start with 98 or 97." });
  }

  db.query("SELECT id FROM users WHERE phone = ?", [phone], (selectErr, existing) => {
    if (selectErr) {
      console.error(selectErr);
      return res.status(500).json({ error: "Database error" });
    }

    if (existing.length > 0) {
      return res.status(409).json({ error: "Phone already registered" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    db.query(
      "INSERT INTO users (full_name, phone, location, password) VALUES (?, ?, ?, ?)",
      [full_name, phone, location, hashed],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "User registered successfully" });
      }
    );
  });
};

export const loginUser = (req, res) => {
  const { phone, password } = req.body || {};

  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }

  db.query("SELECT * FROM users WHERE phone = ?", [phone], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.full_name,
        phone: user.phone,
        location: user.location,
      },
    });
  });
};

export const getProfile = (req, res) => {
  const userId = req.user?.id || req.userId;
  db.query("SELECT id, full_name, phone, location, role FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!results.length) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
};

export const updateProfile = (req, res) => {
  const userId = req.user?.id || req.userId;
  const { full_name, phone, location, password } = req.body || {};

  const updates = [];
  const values = [];

  if (full_name) {
    if (!FULL_NAME_REGEX.test(String(full_name).trim())) {
      return res.status(400).json({ error: "Full name must be like 'Ram Kumar' with 2 words, each 3+ letters, starting with a capital letter." });
    }
    updates.push("full_name = ?");
    values.push(full_name);
  }
  if (phone) {
    if (!PHONE_REGEX.test(String(phone).trim())) {
      return res.status(400).json({ error: "Phone must be 10 digits and start with 98 or 97." });
    }
    updates.push("phone = ?");
    values.push(phone);
  }
  if (location) {
    updates.push("location = ?");
    values.push(location);
  }
  if (password) {
    updates.push("password = ?");
    values.push(bcrypt.hashSync(password, 10));
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No changes provided" });
  }

  values.push(userId);
  db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Profile updated successfully" });
  });
};

export const forgotPassword = (req, res) => {
  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  if (!PHONE_REGEX.test(String(phone).trim())) {
    return res.status(400).json({ error: "Phone must be 10 digits and start with 98 or 97." });
  }

  db.query("SELECT id, full_name FROM users WHERE phone = ?", [phone], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    // For demo purposes, we'll return success without OTP
    // In production, you would send an OTP via SMS here
    const user = results[0];
    res.json({ 
      message: "Phone number verified. You can now reset your password.",
      user_id: user.id,
      full_name: user.full_name
    });
  });
};

export const resetPassword = (req, res) => {
  const { phone, new_password } = req.body || {};

  if (!phone || !new_password) {
    return res.status(400).json({ error: "Phone and new password are required" });
  }

  if (!PHONE_REGEX.test(String(phone).trim())) {
    return res.status(400).json({ error: "Phone must be 10 digits and start with 98 or 97." });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const hashed = bcrypt.hashSync(new_password, 10);
  db.query("UPDATE users SET password = ? WHERE phone = ?", [hashed, phone], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Phone number not found" });
    }

    res.json({ message: "Password reset successfully" });
  });
};

export const logoutUser = (req, res) => {
  // For JWT-based auth, logout is primarily handled on the client side
  // by removing the token. This endpoint can be extended for session management
  // or token blacklisting in the future.
  res.json({ message: "Logged out successfully" });
};
