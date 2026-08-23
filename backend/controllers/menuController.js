import db from "../models/db.js";

const categories = ["Main Meals", "Fast Food & Snacks", "Healthy & Diet", "Desserts & Bakery", "Beverages"];

const findCategoryId = (category, callback) => {
  const categoryName = category || "Main Meals";
  if (!categories.includes(categoryName)) return callback(null, null, "Invalid menu category");
  
  db.query("SELECT id FROM food_categories WHERE name = ?", [categoryName], (error, results) => {
    if (error) return callback(error);
    if (results.length > 0) {
      return callback(null, results[0].id, null);
    }

    db.query("INSERT INTO food_categories (name) VALUES (?)", [categoryName], (insertErr, insertRes) => {
      if (insertErr) return callback(insertErr);
      callback(null, insertRes.insertId, null);
    });
  });
};

export const addMenuItem = (req, res) => {
  const { name, price, description, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }
  
  // Cloudinary returns the permanent HTTPS image URL directly in req.file.path
  const imageUrl = req.file ? req.file.path : null;

  findCategoryId(category, (categoryError, categoryId, validationError) => {
    if (validationError) return res.status(400).json({ error: validationError });
    if (categoryError) return res.status(500).json({ error: "Category error" });

    db.query(
      "INSERT INTO menu (name, price, description, category_id, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, price, description || "", categoryId, imageUrl],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Item insertion error" });
        }
        res.json({ message: "Menu item added successfully" });
      }
    );
  });
};

export const getMenu = (req, res) => {
  db.query(
    `SELECT m.*, COALESCE(c.name, 'Main Meals') AS category
     FROM menu m
     LEFT JOIN food_categories c ON c.id = m.category_id
     WHERE m.is_available = 1
     ORDER BY m.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "menu fetch error" });
      res.json(results);
    }
  );
};

export const getAdminMenu = (req, res) => {
  db.query(
    `SELECT m.*, COALESCE(c.name, 'Main Meals') AS category
     FROM menu m
     LEFT JOIN food_categories c ON c.id = m.category_id
     ORDER BY m.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "admin menu fetch error" });
      res.json(results);
    }
  );
};

export const toggleMenuAvailability = (req, res) => {
  const { id } = req.params;
  const { is_available } = req.body || {};
  db.query("UPDATE menu SET is_available = ? WHERE id = ?", [Boolean(is_available), id], (err) => {
    if (err) return res.status(500).json({ error: "Availability update error" });
    res.json({ message: `Menu item ${is_available ? "shown" : "hidden"}` });
  });
};

export const getCategories = (req, res) => {
  db.query("SELECT id, name FROM food_categories ORDER BY id", (err, results) => {
    if (err) return res.status(500).json({ error: "categories fetch error" });
    res.json(results);
  });
};

export const updateMenuItem = (req, res) => {
  const { id } = req.params;
  const { name, price, description, category } = req.body;
  const newImageUrl = req.file ? req.file.path : null;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  findCategoryId(category, (categoryError, categoryId, validationError) => {
    if (validationError) return res.status(400).json({ error: validationError });
    if (categoryError) return res.status(500).json({ error: "category lookup error" });

    const fields = ["name = ?", "price = ?", "description = ?", "category_id = ?"];
    const values = [name, price, description || "", categoryId];

    if (newImageUrl) {
      fields.push("image_url = ?");
      values.push(newImageUrl);
    }

    values.push(id);

    db.query(`UPDATE menu SET ${fields.join(", ")} WHERE id = ?`, values, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "menu item update error" });
      }
      res.json({ message: "Menu item updated successfully" });
    });
  });
};

export const deleteMenuItem = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM menu WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "menu item deletion error" });
    }
    res.json({ message: "Menu item deleted successfully" });
  });
};