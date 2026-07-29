
const express = require('express');
const app = express();
const db= require('./dbms');
const cors = require('cors');
const bcrypt = require('bcrypt');
app.use(cors());
app.use(express.json());
// Admin check middleware: expects `x-user-id` header containing user id
function requireAdmin(req, res, next) {
  const uid = req.header('x-user-id') || req.body.user_id || req.query.user_id;
  if (!uid) return res.status(401).json({ success: false, message: 'Missing user id' });
  db.query('SELECT role FROM users WHERE id = ? LIMIT 1', [uid], (err, rows) => {
    if (err) {
      console.error('Error checking admin role:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!rows || rows.length === 0) return res.status(403).json({ success: false, message: 'User not found' });
    if (rows[0].role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
  });
}
 
 

app.get('/api/items', (req, res) => {
    const query = `
        SELECT i.id, i.name, i.price, i.image_url,
               c.id AS category_id, c.slug AS category_slug, c.title AS category_title
        FROM items i
        JOIN categories c ON i.category_id = c.id
        ORDER BY c.id, i.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            res.status(500).json({ error: 'Failed to fetch items' });
        } else {
            res.json(results);
        }
    });
});

 
// ---------------- New Registration Route ----------------
app.post('/api/register', async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  try {
    // Step 1: Check if phone already exists
    const checkQuery = "SELECT id FROM users WHERE phone = ? LIMIT 1";
    db.query(checkQuery, [phone], async (err, results) => {
      if (err) {
        console.error('Error checking phone:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length > 0) {
        // Phone already exists
        return res.json({ success: false, message: 'User already exists with this phone number' });
      }

      // Step 2: If not exists, insert new user
      const password_hash = await bcrypt.hash(password, 10);
      const insertQuery = `
        INSERT INTO users (name, phone, password_hash, role)
        VALUES (?, ?, ?, 'user')
      `;
      db.query(insertQuery, [name, phone, password_hash], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, userId: result.insertId });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});



// ---------------- Login Route ----------------
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password required' });
  }

  // Find user by phone
  const query = `SELECT * FROM users WHERE phone = ? LIMIT 1`;
  db.query(query, [phone], async (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = results[0];

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Success: return user info
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  });
});


// Get categories
app.get("/api/categories", (req, res) => {
  db.query("SELECT *FROM categories", (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Note: detailed /api/items route with category join is defined earlier

// Add item
app.post("/api/items", requireAdmin, (req, res) => {
  const { category_id, name, price, image_url } = req.body;
  const sql = "INSERT INTO items (category_id, name, price, image_url) VALUES (?, ?, ?, ?)";
  db.query(sql, [category_id, name, price, image_url], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, category_id, name, price, image_url });
  });
});

// Update item
app.put("/api/items/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const {  name, price, image_url } = req.body;
  const sql = "UPDATE items SET  name=?, price=?, image_url=? WHERE id=?";
  db.query(sql, [ name, price, image_url, id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Item updated");
  });
});

// Delete item
app.delete("/api/items/:id", requireAdmin, (req, res) => {
  db.query("DELETE FROM items WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Item deleted");
  });
});

// Orders are handled by the consolidated POST /api/orders endpoint later in this file.

// List orders (basic; filter by status or user if needed)
app.get('/api/orders', (req, res) => {
  const { status, user_id } = req.query;
  const includeItems = req.query.include_items === '1' || req.query.include_items === 'true';
  const where = [];
  const params = [];

  if (status) {
    // support comma-separated or repeated status params
    let statuses = status;
    if (Array.isArray(status)) statuses = status; // ?status=pending&status=approved
    else if (typeof status === 'string' && status.indexOf(',') !== -1) statuses = status.split(',');
    if (Array.isArray(statuses)) {
      const placeholders = statuses.map(() => '?').join(',');
      where.push(`o.status IN (${placeholders})`);
      statuses.forEach(s => params.push(s));
    } else {
      where.push('o.status = ?');
      params.push(statuses);
    }
  }
  if (user_id) { where.push('o.user_id = ?'); params.push(user_id); }

  const sql = `
      SELECT o.id, o.user_id, o.guest_name, o.guest_phone, o.guest_email,
        o.address, o.total, o.status, o.created_at,
        u.name AS user_name, u.phone AS user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY o.id DESC
  `;
  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    // If caller requested items included, batch query order_items for these orders and attach
    if (includeItems && Array.isArray(rows) && rows.length > 0) {
      const orderIds = rows.map(r => r.id);
      // Build placeholders for IN clause
      const placeholders = orderIds.map(() => '?').join(',');
      const itemsSql = `
        SELECT oi.id, oi.order_id, oi.item_id, oi.qty, oi.price, i.name AS item_name
        FROM order_items oi
        LEFT JOIN items i ON oi.item_id = i.id
        WHERE oi.order_id IN (${placeholders})
      `;
      db.query(itemsSql, orderIds, (err2, itemsRows) => {
        if (err2) {
          console.error('Error fetching order items:', err2);
          return res.status(500).json({ success: false, message: 'Database error fetching order items' });
        }
        // Group items by order_id
        const map = {};
        itemsRows.forEach(it => {
          if (!map[it.order_id]) map[it.order_id] = [];
          map[it.order_id].push(it);
        });
        const detailed = rows.map(r => ({ ...r, items: map[r.id] || [] }));
        return res.json(detailed);
      });
    } else {
      res.json(rows);
    }
  });
});

// Get single order with items and item names
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  const orderSql = `
    SELECT o.id, o.user_id, o.guest_name, o.guest_phone, o.guest_email,
           o.address, o.total, o.status, o.created_at
    FROM orders o
    WHERE o.id = ?
  `;
  const itemsSql = `
    SELECT oi.id, oi.item_id, oi.qty, oi.price, i.name AS item_name
    FROM order_items oi
    LEFT JOIN items i ON oi.item_id = i.id
    WHERE oi.order_id = ?
  `;

  db.query(orderSql, [id], (err, orderRows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (orderRows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    db.query(itemsSql, [id], (err2, itemRows) => {
      if (err2) return res.status(500).json({ success: false, message: 'Database error' });
      res.json({ ...orderRows[0], items: itemRows });
    });
  });
});

// Update order status
app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ['pending', 'approved', 'dispatched', 'delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Consolidated orders endpoint supporting Khalti, Stripe and COD
// Use dynamic import for node-fetch so CommonJS environments don't break if node-fetch is ESM
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.post('/api/orders', async (req, res) => {
  let {
    paymentMethod, // 'khalti' | 'stripe' | 'cod'
    paymentToken,
    paymentIntentId,
    amount, // expected in smallest currency unit for Khalti/Stripe (e.g., paisa)
    user_id,
    guest_name,
    guest_phone,
    guest_email,
    address,
    items
  } = req.body;

  if ((!user_id && !guest_name) || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid order payload' });
  }

  try {
    // Payment verification depending on method
    if (paymentMethod === 'khalti') {
      if (!process.env.KHALTI_SECRET_KEY) return res.status(500).json({ success: false, message: 'Khalti key not configured' });
      const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: paymentToken, amount })
      });
      const data = await response.json();
      if (!data.idx) return res.status(400).json({ success: false, message: 'Khalti payment not confirmed' });
      
    } else if (paymentMethod === 'cod' || !paymentMethod) {
      // Accept COD/no payment
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported payment method' });
    }

    // If a logged-in user placed the order and contact details were not supplied,
    // fetch them from the users table so orders store a snapshot of name/phone.
    if (user_id && (!guest_name || !guest_phone)) {
      try {
        const userRow = await new Promise((resolve, reject) => {
          db.query('SELECT name, phone FROM users WHERE id = ? LIMIT 1', [user_id], (err, rows) => {
            if (err) return reject(err);
            resolve(rows && rows[0] ? rows[0] : null);
          });
        });
        if (userRow) {
          guest_name = guest_name || userRow.name || null;
          guest_phone = guest_phone || userRow.phone || null;
        }
      } catch (fetchErr) {
        console.error('Failed to fetch user contact for order snapshot:', fetchErr);
      }
    }

    const total = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.qty)), 0);
    const insertOrderSql = `
      INSERT INTO orders (user_id, guest_name, guest_phone, guest_email, address, total, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(insertOrderSql, [user_id || null, guest_name || null, guest_phone || null, guest_email || null, address, total],
      (err, result) => {
        if (err) {
          console.error('Error inserting order:', err);
          return res.status(500).json({ success: false, message: 'Database error creating order' });
        }
        const orderId = result.insertId;
        const insertItemsSql = `INSERT INTO order_items (order_id, item_id, qty, price) VALUES ?`;
        const values = items.map(it => [orderId, it.item_id || null, it.qty, it.price]);

        db.query(insertItemsSql, [values], async (err2) => {
          if (err2) {
            console.error('Error inserting order items:', err2);
            return res.status(500).json({ success: false, message: 'Database error creating order items' });
          }
          // WhatsApp notification (best-effort) using helper with retries
          try {
            if (process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_ACCESS_TOKEN && guest_phone) {
              const { sendWhatsAppMessage } = require('./utils/notifications');
              const message = `✅ Your order #${orderId} of Rs. ${total} has been placed successfully!`;
              await sendWhatsAppMessage(guest_phone, message);
            }
          } catch (notifyErr) {
            console.error('WhatsApp notification failed after retries:', notifyErr);
          }
          res.json({ success: true, orderId, total });
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Support messages endpoint (stores guest/user messages for support/chat)
app.post('/api/support', (req, res) => {
  const { user_id, name, phone, email, message } = req.body || {};
  const createSql = `
    CREATE TABLE IF NOT EXISTS support_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      name VARCHAR(200),
      phone VARCHAR(50),
      email VARCHAR(200),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
  db.query(createSql, (createErr) => {
    if (createErr) {
      console.error('Failed to ensure support_messages table:', createErr);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    const insertSql = `INSERT INTO support_messages (user_id, name, phone, email, message) VALUES (?, ?, ?, ?, ?)`;
    db.query(insertSql, [user_id || null, name || null, phone || null, email || null, message || null], (err, result) => {
      if (err) {
        console.error('Failed to insert support message:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, id: result.insertId });
    });
  });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

// Create Stripe Checkout Session (simple flow: single-line item for total amount)
app.post('/api/create-checkout-session', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ success: false, message: 'Stripe not configured' });
  try {
    const { amount, currency = 'usd', successUrl, cancelUrl } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Missing amount' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: 'Food Order' },
            unit_amount: Math.round(amount)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl || 'http://localhost:3000/success',
      cancel_url: cancelUrl || 'http://localhost:3000/cancel'
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed', err);
    res.status(500).json({ success: false, message: 'Stripe session creation failed' });
  }
});