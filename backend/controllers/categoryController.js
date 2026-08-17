import db from "../models/db.js";

export const getAllCategories = (req, res) => {
  db.query(
    "SELECT * FROM food_categories ORDER BY display_order, id",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
};

export const getActiveCategories = (req, res) => {
  db.query(
    "SELECT * FROM food_categories WHERE is_active = 1 ORDER BY display_order, id",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
};

export const getCategoryById = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM food_categories WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!results.length) return res.status(404).json({ error: "Category not found" });
      res.json(results[0]);
    }
  );
};

export const createCategory = (req, res) => {
  const { name, description, image_url, is_active, display_order } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  db.query(
    "INSERT INTO food_categories (name, description, image_url, is_active, display_order) VALUES (?, ?, ?, ?, ?)",
    [name, description || null, image_url || null, is_active !== undefined ? is_active : 1, display_order || 0],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Category name already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ id: result.insertId, message: "Category created successfully" });
    }
  );
};

export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, is_active, display_order } = req.body;
  
  const updates = [];
  const values = [];

  if (name) {
    updates.push("name = ?");
    values.push(name);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    values.push(description);
  }
  if (image_url !== undefined) {
    updates.push("image_url = ?");
    values.push(image_url);
  }
  if (is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(is_active);
  }
  if (display_order !== undefined) {
    updates.push("display_order = ?");
    values.push(display_order);
  }

  if (!updates.length) {
    return res.status(400).json({ error: "No changes provided" });
  }

  values.push(id);

  db.query(
    `UPDATE food_categories SET ${updates.join(", ")} WHERE id = ?`,
    values,
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Category name already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category updated successfully" });
    }
  );
};

export const deleteCategory = (req, res) => {
  const { id } = req.params;

  // Check if category has menu items
  db.query(
    "SELECT COUNT(*) as count FROM menu WHERE category_id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      
      if (results[0].count > 0) {
        return res.status(400).json({ 
          error: "Cannot delete category with existing menu items",
          itemCount: results[0].count
        });
      }

      db.query(
        "DELETE FROM food_categories WHERE id = ?",
        [id],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
          }
          res.json({ message: "Category deleted successfully" });
        }
      );
    }
  );
};

export const getCategoryStats = (req, res) => {
  db.query(
    `SELECT 
      c.id,
      c.name,
      COUNT(m.id) as total_items,
      SUM(CASE WHEN m.is_available = 1 THEN 1 ELSE 0 END) as available_items,
      AVG(m.price) as avg_price,
      SUM(oi.qty) as total_sold
    FROM food_categories c
    LEFT JOIN menu m ON c.id = m.category_id
    LEFT JOIN order_items oi ON m.id = oi.menu_id
    GROUP BY c.id, c.name
    ORDER BY c.display_order, c.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    }
  );
};