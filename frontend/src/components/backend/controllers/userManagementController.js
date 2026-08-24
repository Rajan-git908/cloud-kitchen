import db from "../models/db.js";
import bcrypt from "bcrypt";

export const getAllUsers = (req, res) => {
  const { page = 1, limit = 20, search = "", role = "" } = req.query;
  const offset = (page - 1) * limit;
  
  let query = "SELECT id, full_name as name, phone, location, role, created_at FROM users WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND (full_name LIKE ? OR phone LIKE ?)";
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (role) {
    query += " AND role = ?";
    params.push(role);
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch users" });
    
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const countParams = [];
    
    if (search) {
      countQuery += " AND (full_name LIKE ? OR phone LIKE ?)";
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern);
    }
    
    if (role) {
      countQuery += " AND role = ?";
      countParams.push(role);
    }

    db.query(countQuery, countParams, (countErr, countResults) => {
      if (countErr) return res.status(500).json({ error: "Failed to fetch user count" });
      
      res.json({
        users: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResults[0].total,
          totalPages: Math.ceil(countResults[0].total / limit)
        }
      });
    });
  });
};

export const getUserById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT id, full_name, phone, location, role FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch user" });
      if (!results.length) return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    }
  );
};

export const createUser = (req, res) => {
  const { full_name, phone, location, password, role } = req.body;

  if (!full_name || !phone || !password) {
    return res.status(400).json({ error: "Full name, phone, and password are required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (full_name, phone, location, password, role) VALUES (?, ?, ?, ?, ?)",
    [full_name, phone, location || null, hashedPassword, role || 'user'],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Phone already exists" });
        }
        return res.status(500).json({ error: "Failed to create user" });
      }
      res.status(201).json({ id: result.insertId, message: "User created successfully" });
    }
  );
};

export const updateUser = (req, res) => {
  const { id } = req.params;
  const { full_name, phone, location, password, role } = req.body;

  const updates = [];
  const values = [];

  if (full_name) {
    updates.push("full_name = ?");
    values.push(full_name);
  }
  if (phone) {
    updates.push("phone = ?");
    values.push(phone);
  }
  if (location !== undefined) {
    updates.push("location = ?");
    values.push(location);
  }
  if (password) {
    updates.push("password = ?");
    values.push(bcrypt.hashSync(password, 10));
  }
  if (role) {
    updates.push("role = ?");
    values.push(role);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No changes provided" });
  }

  values.push(id);

  db.query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Phone already exists" });
        }
        return res.status(500).json({ error: "Failed to update user" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User updated successfully" });
    }
  );
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to check user orders" });
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          error: "Cannot delete user with existing orders",
          orderCount: results[0].count
        });
      }

      db.query(
        "DELETE FROM users WHERE id = ?",
        [id],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Failed to delete user" });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "User not found" });
          }
          res.json({ message: "User deleted successfully" });
        }
      );
    }
  );
};

export const getUserStats = (req, res) => {
  db.query(
    `SELECT 
      COUNT(*) as total_users,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
      SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count
    FROM users`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch user stats" });
      res.json(results[0]);
    }
  );
};

export const getUserActivity = (req, res) => {
  const { id } = req.params;
  
  db.query(
    `SELECT 
      o.id,
      o.total,
      o.status,
      o.created_at,
      COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT 10`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch user activity" });
      res.json(results);
    }
  );
};