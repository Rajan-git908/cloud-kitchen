import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Css/OrderItem.css"; // Corrected import statement for CSS

export default function OrderItemModal({ order, onClose }) {
  // Close modal when pressing the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "Preparing": return "status-preparing";
      case "Out for Delivery": return "status-delivery";
      case "Completed": return "status-completed";
      case "Cancelled": return "status-cancelled";
      default: return "status-default";
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        className="oim-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="oim-card"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()} // Prevent backdrop click from firing
        >
          {/* Header */}
          <div className="oim-header">
            <div>
              <h3 className="oim-title">Order {order.id} Details</h3>
              <p className="oim-subtitle">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
                
            </div>
            <button
              type="button"
              className="oim-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="oim-body">
            {/* Meta Information Bar */}
            <div className="oim-meta-bar">
              <div className="oim-meta-item">
                <span className="oim-meta-label">Status:</span>
                <span className={`oim-badge ${getStatusClass(order.status)}`}>
                   {order.status}
                </span>
              </div>
              {order.user_name && (
                <div className="oim-meta-item">
                  <span className="oim-meta-label">Customer:</span>
                  <span className="oim-meta-value">{order.user_name} ({order.user_phone})</span>
                 
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="oim-table-wrapper oim-desktop-only">
              <table className="oim-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => {
                      const unitPrice = Number(item.unit_price || item.price || 0);
                      const qty = Number(item.qty || 0);
                      const subtotal = Number(item.subtotal || qty * unitPrice);

                      return (
                        <tr key={index}>
                          <td className="oim-item-name">
                            {item.menu_item_name || item.name || `Item #${item.menu_id}`}
                          </td>
                          <td className="text-center">{qty}</td>
                          <td className="text-right">Rs. {unitPrice}</td>
                          <td className="text-right oim-subtotal">Rs. {subtotal}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="oim-empty-cell">
                        No item details found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="oim-mobile-list oim-mobile-only">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const unitPrice = Number(item.unit_price || item.price || 0);
                  const qty = Number(item.qty || 0);
                  const subtotal = Number(item.subtotal || qty * unitPrice);

                  return (
                    <div key={index} className="oim-mobile-card">
                      <div>
                        <div className="oim-item-name">
                          {item.menu_item_name || item.name || `Item #${item.menu_id}`}
                        </div>
                        <div className="oim-mobile-sub">
                          {qty} × Rs. {unitPrice}
                        </div>
                      </div>
                      <div className="oim-subtotal">Rs. {subtotal}</div>
                    </div>
                  );
                })
              ) : (
                <div className="oim-empty-cell">No item details found.</div>
              )}
            </div>
          </div>
          <div className="oim-meta-bar">
              <div className="oim-meta-item">
                <span className="oim-meta-label">Delivery Charge:</span>
              <span className="oim-meta-value">Rs. 150</span>
              </div>            </div>

          {/* Footer */}
          <div className="oim-footer">
            <div className="oim-total-container">
              <span className="oim-total-label">Total Amount</span>
              <span className="oim-total-value">Rs. {Number(order.total || 0)+ 150}</span>
            </div>
            <button type="button" className="oim-btn-close" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}