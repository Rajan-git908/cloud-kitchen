// frontend/src/components/ReceiptModal.js
import React from "react";
import "./ReceiptModal.css"; // Simple styling for print view

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const deliveryFee = 150;
  const subtotal = Number(order.total || 0);
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="modal-backdrop">
      <div className="modal-content receipt-box p-4 card">
        <div className="receipt-printable">
          <div className="text-center mb-3">
            <h3>RESTAURANT RECEIPT</h3>
            <p className="text-muted">Order #{order.id}</p>
            <hr />
          </div>

          <div className="mb-3">
            <p><strong>Customer:</strong> {order.user_name || "N/A"}</p>
            <p><strong>Phone:</strong> {order.user_phone || "N/A"}</p>
            <p><strong>Address:</strong> {order.delivery_address || "Standard Delivery"}</p>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {order.payment_method || "COD"}</p>
            <p>
              <strong>Payment Status: </strong> 
              <span className={`badge ${order.payment_status === "Completed" ? "bg-success" : "bg-warning"}`}>
                {order.payment_status || "Pending"}
              </span>
            </p>
          </div>

          <table className="table table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.menu_item_name || `Item #${item.menu_id}`}</td>
                  <td>{item.qty}</td>
                  <td>Rs.{item.unit_price}</td>
                  <td>Rs.{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <hr />
          <div className="text-end">
            <p>Subtotal: Rs.{subtotal}</p>
            <p>Delivery Fee: Rs.{deliveryFee}</p>
            <h5><strong>Grand Total: Rs.{grandTotal}</strong></h5>
          </div>
        </div>

        <div className="d-flex justify-content-between mt-4 no-print">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
}