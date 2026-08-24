import db from "../models/db.js";

export const getOrderItems = (req, res) => {
  const { order_id } = req.params;
  
  db.query(
    `SELECT 
      oi.*,
      m.name as menu_item_name,
      m.category_id,
      m.image_url
    FROM order_items oi
    LEFT JOIN menu m ON oi.menu_id = m.id
    WHERE oi.order_id = ?
    ORDER BY oi.added_at`,
    [order_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch order items" });
      res.json(results);
    }
  );
};

export const createOrderItem = (req, res) => {
  const { order_id, menu_id, qty, price } = req.body;

  if (!order_id || !menu_id || !qty || !price) {
    return res.status(400).json({ error: "Order ID, menu item ID, quantity, and price are required" });
  }

  const subtotal = qty * price;

  db.query(
    `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) 
     VALUES (?, ?, ?, ?, ?)`,
    [order_id, menu_id, qty, price, subtotal],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add order item" });
      
      db.query(
        `UPDATE orders o 
         SET o.total = (
           SELECT COALESCE(SUM(oi.subtotal), 0) 
           FROM order_items oi 
           WHERE oi.order_id = o.id
         )
         WHERE o.id = ?`,
        [order_id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: "Failed to update order total" });
          res.status(201).json({ id: result.insertId, message: "Order item added successfully" });
        }
      );
    }
  );
};

export const updateOrderItem = (req, res) => {
  const { id } = req.params;
  const { qty, price } = req.body;

  const updates = [];
  const values = [];

  if (qty !== undefined) {
    updates.push("qty = ?");
    values.push(qty);
  }
  if (price !== undefined) {
    updates.push("unit_price = ?");
    values.push(price);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No changes provided" });
  }

  if (qty !== undefined && price !== undefined) {
    updates.push("subtotal = ?");
    values.push(qty * price);
  }

  values.push(id);

  db.query(
    `UPDATE order_items SET ${updates.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to update order item" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Order item not found" });
      }

      db.query(
        `SELECT order_id FROM order_items WHERE id = ?`,
        [id],
        (selectErr, selectResults) => {
          if (selectErr || !selectResults.length) {
            return res.json({ message: "Order item updated successfully" });
          }

          const orderId = selectResults[0].order_id;
          db.query(
            `UPDATE orders o 
             SET o.total = (
               SELECT COALESCE(SUM(oi.subtotal), 0) 
               FROM order_items oi 
               WHERE oi.order_id = o.id
             )
             WHERE o.id = ?`,
            [orderId],
            (updateErr) => {
              if (updateErr) return res.status(500).json({ error: "Failed to update order total" });
              res.json({ message: "Order item updated successfully" });
            }
          );
        }
      );
    }
  );
};

export const deleteOrderItem = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT order_id FROM order_items WHERE id = ?",
    [id],
    (selectErr, selectResults) => {
      if (selectErr) return res.status(500).json({ error: "Failed to fetch order item" });
      if (!selectResults.length) return res.status(404).json({ error: "Order item not found" });

      const orderId = selectResults[0].order_id;

      db.query(
        "DELETE FROM order_items WHERE id = ?",
        [id],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Failed to delete order item" });
          
          db.query(
            `UPDATE orders o 
             SET o.total = (
               SELECT COALESCE(SUM(oi.subtotal), 0) 
               FROM order_items oi 
               WHERE oi.order_id = o.id
             )
             WHERE o.id = ?`,
            [orderId],
            (updateErr) => {
              if (updateErr) return res.status(500).json({ error: "Failed to update order total" });
              res.json({ message: "Order item deleted successfully" });
            }
          );
        }
      );
    }
  );
};

export const bulkAddOrderItems = (req, res) => {
  const { order_id, items } = req.body;

  if (!order_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order ID and items array are required" });
  }

  const values = items.map(item => [
    order_id,
    item.menu_id,
    item.qty,
    item.price, // unit_price
    item.qty * item.price // subtotal
  ]);

  db.query(
    `INSERT INTO order_items (order_id, menu_id, qty, unit_price, subtotal) 
     VALUES ?`,
    [values],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Failed to add order items" });
      
      db.query(
        `UPDATE orders o 
         SET o.total = (
           SELECT COALESCE(SUM(oi.subtotal), 0) 
           FROM order_items oi 
           WHERE oi.order_id = o.id
         )
         WHERE o.id = ?`,
        [order_id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: " Failed to update order total" });
          res.status(201).json({ 
            message: "Order items added successfully",
            addedCount: result.affectedRows 
          });
        }
      );
    }
  );
};