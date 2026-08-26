// frontend/src/components/UserDashboard.js
import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import OrderItem from "./OrderItem";

import ReceiptModal from "./ReceiptModel";
import "./Css/Receiptmodel.css";

export default function UserDashboard() {
  const { token, apiBaseUrl } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get(`${apiBaseUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err));
    }
  }, [token, apiBaseUrl]);

  useEffect(() => {
    if (!token) return;

    const pollOrderStatus = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedOrders = res.data;

        const statusChanged = updatedOrders.some((order, index) => {
          const existingOrder = orders[index];
          return existingOrder && existingOrder.status !== order.status;
        });

        if (statusChanged) {
          setOrders(updatedOrders);
          setMessage(" Order status updated! Check your orders below.");
          setTimeout(() => setMessage(""), 5000);
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    };

    const pollInterval = setInterval(pollOrderStatus, 15000);
    return () => clearInterval(pollInterval);
  }, [token, apiBaseUrl, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  

  const parseItems = (items) => {
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        return JSON.parse(items);
      } catch (err) {
        return [];
      }
    }
    return [];
  };

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const completedOrders = orders.filter((order) => order.status === "Completed").length;

  return (
    <motion.div
      className="container py-4 dashboard-page user-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2>My Dashboard</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="performance-grid">
        <div className="performance-card">
          <span className="eyebrow">Orders</span>
          <strong>{orders.length}</strong>
          <small>Total placed</small>
        </div>
        <div className="performance-card">
          <span className="eyebrow">Completed</span>
          <strong>{completedOrders}</strong>
          <small>Meals enjoyed</small>
        </div>
        <div className="performance-card">
          <span className="eyebrow">Your table</span>
          <strong>Rs. {totalSpent.toFixed(0)}</strong>
          <small>Total spent</small>
        </div>
      </div>

      <div className="card p-3 mt-4">
        <h4>My Order</h4>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemList = parseItems(order.items);
                const itemCount = itemList.length;

                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedOrder({ ...order, items: itemList })}
                        disabled={itemCount === 0}
                      >
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </button>
                    </td>
                    <td>
  <span className="badge bg-light text-dark">{order.payment_method || 'COD'}</span>
  <br />
  <small className="text-muted">{order.payment_status || 'Pending'}</small>
</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                         {order.status}
                      </span>
                    </td>
                    <td>Rs. {Number(order.total) + 150}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
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
              })}
            </tbody>
          </table>
        )}

<AnimatePresence>
  {selectedOrder && (
    <OrderItem
      order={selectedOrder}
      onClose={() => setSelectedOrder(null)}
    />
  )}

  {receiptOrder && (
    <ReceiptModal
      order={receiptOrder}
      onClose={() => setReceiptOrder(null)}
    />
  )}
</AnimatePresence>
      </div>
    </motion.div>
  );
}