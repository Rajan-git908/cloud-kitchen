import db from "../models/db.js";

// Testimonial/Review management (testimonials are stored as reviews in the reviews table)
export const getAllTestimonials = (req, res) => {
  db.query("SELECT * FROM reviews ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

export const updateTestimonial = (req, res) => {
  const { id } = req.params;
  const { approved, rating, text, admin_response, is_verified } = req.body || {};
  db.query("UPDATE reviews SET approved = ?, rating = ?, text = ?, admin_response = ?, is_verified = ? WHERE id = ?", [Boolean(approved), rating || 5, text || "", admin_response || null, Boolean(is_verified), id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Review updated" });
  });
};

export const deleteTestimonial = (req, res) => {
  db.query("DELETE FROM reviews WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Review deleted" });
  });
};
