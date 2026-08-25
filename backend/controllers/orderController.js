/* //order controller
import db from "../models/db.js";



// orderController.js
export const fetchOrders = (req, res) => {
  const userId = req.user?.id || req.userId;

  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.created_at,
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
  /*
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
// --------------------------------------/

//for geo map location
db.query(
    `INSERT INTO orders (user_id, total, status, latitude, longitude, delivery_address) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, orderTotal, "Pending", latitude || null, longitude || null, delivery_address || null], //[cite: 55]
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message || "Database error" }); //[cite: 55]
      
      const orderId = result.insertId; //[cite: 55]
      const orderItems = items.map((item) => { //[cite: 55]
        const qty = Number(item.qty || item.quantity); //[cite: 55]
        const unitPrice = Number(item.price); //[cite: 55]
        const subtotal = qty * unitPrice; //[cite: 55]
        return [orderId, item.menu_id || item.id, qty, unitPrice, subtotal]; //[cite: 55]
      });

      db.query(
        `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) VALUES ?`, //[cite: 55]
        [orderItems], //[cite: 55]
        (itemErr) => {
          if (itemErr) { //[cite: 55]
            console.error("Error inserting order items:", itemErr); //[cite: 55]
            return res.status(500).json({ error: "Failed to record order details" }); //[cite: 55]
          }

          res.status(201).json({ 
            id: orderId, 
            message: "Order placed successfully with delivery location" 
          });
        }
      );
    }
  );
};



/*
export const fetchAllOrders = (req, res) => {
  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.created_at,
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

      // Clean up stringified JSON outputs if database driver returns them as string
      const parsedResults = results.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []).filter(Boolean)
      }));

      res.json(parsedResults);
    }
  );
};
//-----------------------------------------------

//location 
export const fetchAllOrders = (req, res) => {
  db.query(
    `SELECT 
      o.id, o.user_id, o.total, o.status, o.created_at,
      o.latitude, o.longitude, o.delivery_address,
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
    `SELECT o.id, o.user_id, o.total, o.status, o.created_at,
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