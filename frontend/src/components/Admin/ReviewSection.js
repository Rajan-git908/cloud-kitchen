
//component/Admin/OverViewSection.js
import React from "react";
import { motion } from "framer-motion";

export default function ReviewSection({ menuCount, orderCount, reviews, moderateReview, removeReview }) {
  return (
    <div id="dashboard">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h3>{menuCount}</h3>
            <p className="text-muted mb-0">Total Menu Items</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h3>{orderCount}</h3>
            <p className="text-muted mb-0">Total Orders</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <h3>{reviews.length}</h3>
            <p className="text-muted mb-0">Customer Reviews</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Sub-section */}
      <motion.div 
        className="card p-3 mb-4" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>Customer Reviews <span className="section-count">{reviews.length}</span></h4>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length ? reviews.map((review) => { 
                const isApproved = Number(review.approved) === 1 || review.approved === true; 
                return (
                  <tr key={review.id}>
                    <td><strong>{review.name}</strong></td>
                    <td className="review-cell">{review.text}</td>
                    <td className="review-stars">{"★".repeat(Number(review.rating) || 0)}</td>
                    <td>
                      <span className={`status-pill ${isApproved ? "status-live" : "status-hidden"}`}>
                        {isApproved ? "Shown" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <button className="table-action" onClick={() => moderateReview(review, !isApproved)}>
                        {isApproved ? "Hide" : "Show"}
                      </button>
                      <button className="table-action danger" onClick={() => removeReview(review.id)}>Delete</button>
                    </td>
                  </tr>
                ); 
              }) : (
                <tr><td colSpan="5" className="table-empty">No customer reviews yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}