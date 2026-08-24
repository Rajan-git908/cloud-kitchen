import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Reviews() {
  const { user, token, apiBaseUrl } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const loadReviews = () =>
    axios
      .get(`${apiBaseUrl}/api/reviews`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/reviews`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, [apiBaseUrl]);

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await axios.post(
        `${apiBaseUrl}/api/reviews`,
        {
          name: user.name || user.full_name,
          text,
          rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setText("");
      setMessage("Thanks for sharing your experience.");
      loadReviews();
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to submit review.");
    }
  };

  // Duplicate items so the animation seamlessly wraps around
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <motion.section
      className="reviews"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <span className="eyebrow">Kind words</span>
          <h2>What our customers say.</h2>
          <p className="section-subtitle">
            Your table is part of the story. Tell us how dinner went.
          </p>
        </div>
      </motion.div>

      {/* Infinite Right-to-Left Ticker Container */}
      <div className="slider-container">
        <div className="slider-track">
          {duplicatedReviews.map((review, index) => (
            <article className="review-card slide-card" key={`${review.id}-${index}`}>
              <h5>{review.name}</h5>
              <div
                className="stars"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
              <p>“{review.text}”</p>
            </article>
          ))}
        </div>
      </div>

      {user ? (
        <motion.form
          className="review-form"
          onSubmit={submitReview}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <textarea
            className="form-control"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Tell us about your order"
            required
            rows="3"
          />
          <select
            className="form-control"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            aria-label="Rating"
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          <motion.button
            className="button-primary"
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Share review
          </motion.button>
          {message && <small>{message}</small>}
        </motion.form>
      ) : (
        <motion.div
          className="review-invite"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <strong>Enjoyed your order?</strong>
          <span>
            Sign in to leave a rating and help the next customer choose.
          </span>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="button-secondary"
              style={{ textDecoration: "none" }}
            >
              Share your experience
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default Reviews;