/*
// orderController.js
import db from "../models/db.js";

export const fetchOrders = (req, res) => {
  const userId = req.user?.id || req.userId;

  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.created_at, o.delivery_address,
      COALESCE(
        JSON_ARRAYAGG(
          IF(oi.id IS NOT NULL,
            JSON_OBJECT(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_item_name', m.name,
              'qty', oi.qty,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            ),
            NULL
          )
        ),
        JSON_ARRAY()
      ) as items
     FROM orders o 
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m ON oi.menu_id = m.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });

      const parsedResults = results.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []).filter(Boolean)
      }));

      res.json(parsedResults);
    }
  );
};

export const placeOrder = (req, res) => {
  const userId = req.user?.id || req.userId;
  const { total, items, delivery_address } = req.body || {};
  const orderTotal = Number(total);

  if (!userId) {
    return res.status(401).json({ error: "Please login to place an order" });
  }

  if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
    return res.status(400).json({ error: "A valid order total is required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const finalAddress = (delivery_address && delivery_address.trim() !== "") 
    ? delivery_address 
    : "Standard Delivery";

  db.query(
    `INSERT INTO orders (user_id, total, status, delivery_address) VALUES (?, ?, ?, ?)`,
    [userId, orderTotal, "Pending", finalAddress],
    (err, result) => {
      if (err) {
        console.error("Orders Insert Error:", err);
        return res.status(500).json({ error: err.message || "Failed to create order in database" });
      }
      
      const orderId = result.insertId;
      const orderItems = items.map((item) => {
        const qty = Number(item.qty || item.quantity || 1);
        const unitPrice = Number(item.price || item.unit_price || 0);
        const subtotal = qty * unitPrice;
        return [orderId, item.menu_id || item.id, qty, unitPrice, subtotal];
      });

      db.query(
        `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) VALUES ?`,
        [orderItems],
        (itemErr) => {
          if (itemErr) {
            console.error("Order Items Insert Error:", itemErr);
            return res.status(500).json({ error: itemErr.message || "Failed to record order items" });
          }

          res.status(201).json({ 
            id: orderId, 
            message: "Order placed successfully" 
          });
        }
      );
    }
  );
};

export const fetchAllOrders = (req, res) => {
  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.created_at, o.delivery_address,
      u.full_name as user_name, u.phone as user_phone, u.location as user_location,
      COALESCE(
        JSON_ARRAYAGG(
          IF(oi.id IS NOT NULL,
            JSON_OBJECT(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_item_name', m.name,
              'qty', oi.qty,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            ),
            NULL
          )
        ),
        JSON_ARRAY()
      ) as items
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m ON oi.menu_id = m.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });

      const parsedResults = results.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []).filter(Boolean)
      }));

      res.json(parsedResults);
    }
  );
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  
  db.query(
    `SELECT o.id, o.user_id, o.total, o.status, o.created_at, o.delivery_address,
            u.full_name as user_name, u.phone as user_phone, u.location as user_location
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      if (!results.length) return res.status(404).json({ error: "Order not found" });
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
*/

// orderController.js
import db from "../models/db.js";

export const fetchOrders = (req, res) => {
  const userId = req.user?.id || req.userId;

  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.payment_method, o.payment_status, o.created_at, o.delivery_address,
      COALESCE(
        JSON_ARRAYAGG(
          IF(oi.id IS NOT NULL,
            JSON_OBJECT(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_item_name', m.name,
              'qty', oi.qty,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            ),
            NULL
          )
        ),
        JSON_ARRAY()
      ) as items
     FROM orders o 
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m ON oi.menu_id = m.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });

      const parsedResults = results.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []).filter(Boolean)
      }));

      res.json(parsedResults);
    }
  );
};

export const placeOrder = (req, res) => {
  const userId = req.user?.id || req.userId;
  const { total, items, delivery_address, payment_method } = req.body || {};
  const orderTotal = Number(total);
  const selectedPaymentMethod = payment_method || "COD";

  if (!userId) {
    return res.status(401).json({ error: "Please login to place an order" });
  }

  if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
    return res.status(400).json({ error: "A valid order total is required" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty" });
  }

  const finalAddress = (delivery_address && delivery_address.trim() !== "") 
    ? delivery_address 
    : "Standard Delivery";

  db.query(
    `INSERT INTO orders (user_id, total, status, payment_method, payment_status, delivery_address) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, orderTotal, "Pending", selectedPaymentMethod, "Pending", finalAddress],
    (err, result) => {
      if (err) {
        console.error("Orders Insert Error:", err);
        return res.status(500).json({ error: err.message || "Failed to create order in database" });
      }
      
      const orderId = result.insertId;

      // Insert audit log into payments table
      db.query(
        `INSERT INTO payments (order_id, user_id, amount, payment_method, status) VALUES (?, ?, ?, ?, 'Pending')`,
        [orderId, userId, orderTotal, selectedPaymentMethod]
      );

      const orderItems = items.map((item) => {
        const qty = Number(item.qty || item.quantity || 1);
        const unitPrice = Number(item.price || item.unit_price || 0);
        const subtotal = qty * unitPrice;
        return [orderId, item.menu_id || item.id, qty, unitPrice, subtotal];
      });

      db.query(
        `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) VALUES ?`,
        [orderItems],
        (itemErr) => {
          if (itemErr) {
            console.error("Order Items Insert Error:", itemErr);
            return res.status(500).json({ error: itemErr.message || "Failed to record order items" });
          }

          res.status(201).json({ 
            id: orderId, 
            message: "Order placed successfully" 
          });
        }
      );
    }
  );
};

export const fetchAllOrders = (req, res) => {
  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.payment_method, o.payment_status, o.created_at, o.delivery_address,
      u.full_name as user_name, u.phone as user_phone, u.location as user_location,
      COALESCE(
        JSON_ARRAYAGG(
          IF(oi.id IS NOT NULL,
            JSON_OBJECT(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_item_name', m.name,
              'qty', oi.qty,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            ),
            NULL
          )
        ),
        JSON_ARRAY()
      ) as items
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN menu m ON oi.menu_id = m.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });

      const parsedResults = results.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []).filter(Boolean)
      }));

      res.json(parsedResults);
    }
  );
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  
  db.query(
    `SELECT o.id, o.user_id, o.total, o.status, o.payment_method, o.payment_status, o.created_at, o.delivery_address,
            u.full_name as user_name, u.phone as user_phone, u.location as user_location
     FROM orders o 
     LEFT JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      if (!results.length) return res.status(404).json({ error: "Order not found" });
      res.json(results[0]);
    }
  );
};

export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: "Status field is required" });
  }

  // 1. Auto-set payment_status to 'Completed' if order status is set to 'Completed'
  let targetPaymentStatus = payment_status;
  if (!targetPaymentStatus && status === "Completed") {
    targetPaymentStatus = "Completed";
  }

  // 2. Build dynamic SQL query for orders table
  const fields = ["status = ?"];
  const values = [status];

  if (targetPaymentStatus) {
    fields.push("payment_status = ?");
    values.push(targetPaymentStatus);
  }

  values.push(id);

  db.query(
    `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      // 3. Keep payments audit table synchronized if payment_status changed
      if (targetPaymentStatus) {
        db.query(
          `UPDATE payments SET status = ? WHERE order_id = ?`,
          [targetPaymentStatus, id],
          (payErr) => {
            if (payErr) {
              console.error("Failed to sync payments table status:", payErr.message);
            }
          }
        );
      }

      res.json({ message: "Order status updated successfully" });
    }
  );
};