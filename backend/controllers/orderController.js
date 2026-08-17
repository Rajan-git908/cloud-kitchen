//order controller
import db from "../models/db.js";
export const fetchOrders = (req, res) => {
  const userId = req.user?.id || req.userId;
  
  db.query(
    `SELECT o.id, o.user_id, o.total, o.status, o.created_at
     FROM orders o 
     WHERE o.user_id = ? 
     ORDER BY o.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      res.json(results);
    }
  );
};

export const placeOrder = (req, res) => {
  const userId = req.user?.id || req.userId;
  const { total, items } = req.body || {};
  const orderTotal = Number(total);

  // Require user authentication
  if (!userId) {
    return res.status(401).json({ error: "Please login to place an order" });
  }

  if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
    return res.status(400).json({ error: "A valid order total is required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  // Insert main order record
  db.query(
    `INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)`,
    [userId, orderTotal, "Pending"],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      
      const orderId = result.insertId;

      // Map item array matching order_items schema: order_id, menu_id, qty, unit_price, subtotal
      const orderItems = items.map((item) => {
        const qty = Number(item.qty || item.quantity);
        const unitPrice = Number(item.price);
        const subtotal = qty * unitPrice;
        return [orderId, item.menu_id || item.id, qty, unitPrice, subtotal];
      });

      db.query(
        `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) VALUES ?`,
        [orderItems],
        (itemErr) => {
          if (itemErr) {
            console.error("Error inserting order items:", itemErr);
            return res.status(500).json({ error: "Failed to record order details" });
          }

          res.status(201).json({ id: orderId, message: "Order placed successfully" });
        }
      );
    }
  );
};

export const fetchAllOrders = (req, res) => {
  db.query(
    `SELECT o.id, o.user_id, o.total, o.status, o.created_at,
            u.full_name as user_name, u.phone as user_phone, u.location as user_location
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      res.json(results);
    }
  );
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  
  db.query(
    `SELECT o.id, o.user_id, o.total, o.status, o.created_at,
            u.full_name as user_name, u.phone as user_phone, u.location as user_location
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      if (!results.length) return res.status(404).json({ error: "Order ot found" });
      res.json(results[0]);
    }
  );
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: "Status field is required" });
  }

  db.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Error updating order status" });
      }

      res.json({ message: "Order status updated successfully" });
    }
  );
};