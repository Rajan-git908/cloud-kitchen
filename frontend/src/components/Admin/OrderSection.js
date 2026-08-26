// component/Admin/OrderSection.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrderItem from "../OrderItem";

export default function OrdersSection({
  orders,
  updateStatus,
  getStatusColor,
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  return (
    <motion.div
      className="card p-3 mb-4"
      id="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4>
        Order Tracking <span className="section-count">{orders.length}</span>
      </h4>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Phone Number</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? (
              orders.map((order) => {
                const itemCount = order.items?.length || order.item_count || 0;
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedOrder(order)}
                        disabled={!order.items || order.items.length === 0}
                      >
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </button>
                    </td>
                    <td>{order.user_phone}</td>
                    <td>{order.user_name}</td>
                    <td>
                      <span>
                        {order.delivery_address || order.user_location || "N/A"}
                      </span>
                    </td>
                    <td>Rs.{Number(order.total) + 150}</td>
                    <td>
                      <div>
                        <strong>{order.payment_method || "COD"}</strong>
                      </div>
                      <small className="text-muted">
                        {order.payment_status || "Pending"}
                      </small>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        className={`table-select ${getStatusColor(order.status)}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="Pending"> Pending</option>
                        <option value="Preparing"> Preparing</option>
                        <option value="Out for Delivery">
                          {" "}
                          Out for Delivery
                        </option>
                        <option value="Completed"> Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      {order.payment_status === "Completed" ? (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => setReceiptOrder(order)}
                        >
                          Receipt
                        </button>
                      ) : (
                        <span className="text-muted">Payment Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="table-empty">
                  No customer orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Item Details Modal with AnimatePresence */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderItem
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
