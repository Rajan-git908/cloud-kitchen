import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderItemModal({ order, onClose }) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
        <motion.div 
          className="modal-dialog modal-dialog-centered"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order #{order.id} Details</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p className="mb-2"><strong>Status:</strong> <span className="badge bg-info">{order.status}</span></p>
              <p className="mb-2"><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>

              <table className="table table-bordered table-striped mt-3">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.menu_item_name || item.name || `Item #${item.menu_id}`}</td>
                        <td>{item.qty}</td>
                        <td>Rs.{item.unit_price || item.price}</td>
                        <td>Rs.{item.subtotal || (item.qty * (item.unit_price || item.price))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No item details found.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="3" className="text-end">Total Amount:</th>
                    <th>Rs.{order.total}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}