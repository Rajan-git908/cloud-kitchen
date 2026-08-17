import db from "../models/db.js";

export const getReviews = (req, res) => {
  const query = `
    SELECT 
      r.id, 
      r.user_id, 
      COALESCE(r.name, u.full_name, 'Anonymous') AS name, 
      r.text, 
      r.rating, 
      r.approved, 
      r.created_at
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.approved = TRUE
    ORDER BY r.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

export const addReview = (req, res) => {
  const userId = req.user?.id || null;
  const { name, text, rating } = req.body || {};
  
  if (!name || !text) return res.status(400).json({ error: "Name and review are required" });
  
  const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));
  
  
  db.query(
    "INSERT INTO reviews (user_id, name, text, rating) VALUES (?, ?, ?, ?)", 
    [userId, name, text, safeRating], 
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({ id: result.insertId, message: "Review submitted" });
    }
  );
};

export const getAllReviews = (req, res) => {
  db.query("SELECT * FROM reviews ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

export const updateReview = (req, res) => {
  const { id } = req.params;
  const { approved, rating, text } = req.body || {};
  
  db.query(
    "UPDATE reviews SET approved = ?, rating = ?, text = ? WHERE id = ?", 
    [Boolean(approved), rating || 5, text || "", id], 
    (err) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ message: "Review updated" });
    }
  );
};

export const deleteReview = (req, res) => {
  db.query("DELETE FROM reviews WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Review deleted" });
  });
};

export const getReviewById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM reviews WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results.length) return res.status(404).json({ error: "Review not found" });
    res.json(results[0]);
  });
};

export const markReviewHelpful = (req, res) => {
  res.json({ message: "Review marked as helpful" });
};

export const getReviewStats = (req, res) => {
  db.query(
    `SELECT 
      COUNT(*) as total_reviews,
      AVG(rating) as average_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star,
      SUM(CASE WHEN approved = TRUE THEN 1 ELSE 0 END) as approved_reviews
    FROM reviews`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results[0]);
    }
  );
};