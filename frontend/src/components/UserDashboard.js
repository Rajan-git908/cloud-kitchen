import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const FULL_NAME_REGEX = /^[A-Z][a-z]{2,}(?: [A-Z][a-z]{2,})$/;
const PHONE_REGEX = /^(98|97)\d{8}$/;

function UserDashboard() {
  const { token, user, apiBaseUrl } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(user || null);
  const [fullName, setFullName] = useState(user?.name || user?.full_name || "");
  const [location, setLocation] = useState(user?.location || "");
  const [message, setMessage] = useState("");
  const [lastOrderUpdate, setLastOrderUpdate] = useState(Date.now());
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [contact, setContact] = useState(user?.phone || "");

  useEffect(() => {
    if (token) {
      axios.get(`${apiBaseUrl}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          setProfile(res.data);
          setFullName(res.data.full_name || "");
          setLocation(res.data.location || "");
        })
        .catch((err) => console.error(err));

      axios.get(`${apiBaseUrl}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err));
    }
  }, [token, apiBaseUrl]);


  useEffect(() => {
    if (token) {
      const pollOrderStatus = async () => {
        try {
          const res = await axios.get(`${apiBaseUrl}/api/orders`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          const updatedOrders = res.data;
          
          // Check if any order status changed
          const statusChanged = updatedOrders.some((order, index) => {
            const existingOrder = orders[index];
            return existingOrder && existingOrder.status !== order.status;
          });
          
          if (statusChanged) {
            setOrders(updatedOrders);
            setMessage("🔄 Order status updated! Check your orders below.");
            setTimeout(() => setMessage(""), 5000);
          }
        } catch (err) {
          console.error("Error polling order status:", err);
        }
      };

      const pollInterval = setInterval(pollOrderStatus, 15000);
      
      return () => clearInterval(pollInterval);
    }
  }, [token, apiBaseUrl, orders]);

  const handleSave = async (e) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setMessage("Full name is required");
      return;
    }
    if (!FULL_NAME_REGEX.test(trimmedName)) {
      setMessage("Full name must be like 'Ram Kumar' with 2 words, each 3+ letters, starting with a capital letter.");
      return;
    }
    if (profile?.phone && !PHONE_REGEX.test(String(profile.phone).trim())) {
      setMessage("Phone must be 10 digits and start with 98 or 97.");
      return;
    }

    try {
      await axios.put(`${apiBaseUrl}/api/auth/profile`, { full_name: fullName, location }, { headers: { Authorization: `Bearer ${token}` } });
      setProfile((current) => ({ ...current, full_name: fullName, location }));
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage("Unable to update profile");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return '⏳';
      case 'Preparing': return '👨‍🍳';
      case 'Delivered': return '✅';
      case 'Cancelled': return '❌';
      default: return '📦';
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const deliveredOrders = orders.filter((order) => order.status === "Delivered").length;

  const getOrderItems = (order) => {
    const rawItems = order.items;

    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === "string") {
      try {
        const parsedItems = JSON.parse(rawItems);
        return Array.isArray(parsedItems) ? parsedItems : [];
      } catch (error) {
        return [];
      }
    }

    return [];
  };

  const toggleOrderItems = (orderId) => {
    setExpandedOrderId((currentOrderId) => (currentOrderId === orderId ? null : orderId));
  };

  return (
    <motion.div 
      className="container py-4 dashboard-page user-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        My Dashboard
      </motion.h2>
      
      {message && (
        <motion.div 
          className="alert alert-success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {message}
        </motion.div>
      )}
      
      <motion.div 
        className="performance-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="performance-card"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <span className="eyebrow">Orders</span>
          <strong>{orders.length}</strong>
          <small>Total placed</small>
        </motion.div>
        <motion.div 
          className="performance-card"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <span className="eyebrow">Delivered</span>
          <strong>{deliveredOrders}</strong>
          <small>Meals enjoyed</small>
        </motion.div>
        <motion.div 
          className="performance-card"
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <span className="eyebrow">Your table</span>
          <strong>Rs. {totalSpent.toFixed(0)}</strong>
          <small>Total spent</small>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="card p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h4>Order History</h4>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderItems = getOrderItems(order);
                const isExpanded = expandedOrderId === order.id;

                return (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      {order.table_number ? (
                        <span className="table-badge">🍽️ {order.table_number}</span>
                      ) : (
                        <span className="table-badge online">📱 Online</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-column align-items-start gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => toggleOrderItems(order.id)}
                        >
                          {isExpanded ? "Hide Items" : "Get Items"}
                        </button>

                        {isExpanded && (
                          <ul className="mb-0 ps-3">
                            {orderItems.length > 0 ? (
                              orderItems.map((item, index) => (
                                <li key={`${order.id}-${item.name || item.item_name || item.menu_name || "item"}-${index}`}>
                                  {item.name || item.item_name || item.menu_name || "Item"} Qty. {item.quantity ?? item.qty ?? 1}
                                </li>
                              ))
                            ) : (
                              <li>No items available</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                    <td> <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span></td>
                    <td>Rs. {order.total}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}

export default UserDashboard;
