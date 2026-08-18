import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import ReviewSection from "./Admin/ReviewSection";
import MenuSection from "./Admin/MenuSection";
import OrderSection from "./Admin/OrderSection";
import UserSection from "./Admin/UserSection";

import "./AdminDashboard.css"; // Imported separate CSS stylesheet

const menuCategories = [
  "Main Meals",
  "Fast Food & Snacks",
  "Healthy & Diet",
  "Desserts & Bakery",
  "Beverages",
];

export default function AdminDashboard() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { token, apiBaseUrl } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(menuCategories[0]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [newOrderNotification, setNewOrderNotification] = useState(null);

  // Audio chime for new orders using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio playback not allowed without prior user interaction.");
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const [menuRes, ordersRes, reviewsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/menu/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiBaseUrl}/api/orders/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiBaseUrl}/api/reviews/admin/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMenuItems(menuRes.data);
      setOrders(ordersRes.data);
      setPreviousOrderCount(ordersRes.data.length);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.error || "Data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token, apiBaseUrl]);

  // Polling for incoming new orders
  useEffect(() => {
    if (!token) return;

    loadData();

    const pollOrders = async () => {
      try {
        const ordersRes = await axios.get(`${apiBaseUrl}/api/orders/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentOrders = ordersRes.data;

        if (previousOrderCount > 0 && currentOrders.length > previousOrderCount) {
          const newOrdersCount = currentOrders.length - previousOrderCount;
          const latestOrder = currentOrders[0]; // Assuming array is ordered by date desc

          setNewOrderNotification({
            id: latestOrder.id,
            total: latestOrder.total,
            count: newOrdersCount,
            timestamp: new Date(latestOrder.created_at || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });

          playNotificationSound();
        }

        setOrders(currentOrders);
        setPreviousOrderCount(currentOrders.length);
      } catch (err) {
        console.error("Error polling orders:", err);
      }
    };

    const pollInterval = setInterval(pollOrders, 10000);
    return () => clearInterval(pollInterval);
  }, [token, apiBaseUrl, previousOrderCount, loadData]);

  // Auto-dismiss toast notification after 12 seconds
  useEffect(() => {
    if (newOrderNotification) {
      const timer = setTimeout(() => {
        setNewOrderNotification(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [newOrderNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      if (image) formData.append("image", image);

      if (editingId) {
        await axios.put(`${apiBaseUrl}/api/menu/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("Menu item updated successfully!");
      } else {
        await axios.post(`${apiBaseUrl}/api/menu`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("Menu item added successfully!");
      }

      setName("");
      setPrice("");
      setDescription("");
      setCategory(menuCategories[0]);
      setImage(null);
      setEditingId(null);
      loadData();
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price);
    setDescription(item.description || "");
    setCategory(item.category || menuCategories[0]);
    navigate("/admin/menu");
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/api/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.patch(
        `${apiBaseUrl}/api/menu/${item.id}/availability`,
        { is_available: !item.is_available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      setMessage("Unable to update item visibility");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${apiBaseUrl}/api/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const moderateReview = async (review, approved) => {
    await axios.put(
      `${apiBaseUrl}/api/reviews/${review.id}`,
      { approved, rating: review.rating, text: review.text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadData();
  };

  const removeReview = async (id) => {
    await axios.delete(`${apiBaseUrl}/api/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Preparing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const renderActiveSection = () => {
    switch (section) {
      case "users":
        return <UserSection />;
      case "orders":
        return (
          <OrderSection
            orders={sortedOrders}
            updateStatus={updateStatus}
            getStatusColor={getStatusColor}
          />
        );
      case "menu":
        return (
          <MenuSection
            menuItems={menuItems}
            apiBaseUrl={apiBaseUrl}
            startEdit={startEdit}
            toggleAvailability={toggleAvailability}
            removeItem={removeItem}
            handleSubmit={handleSubmit}
            editingId={editingId}
            name={name}
            setName={setName}
            price={price}
            setPrice={setPrice}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            setImage={setImage}
            menuCategories={menuCategories}
          />
        );
      default:
        return (
          <ReviewSection
            menuCount={menuItems.length}
            orderCount={orders.length}
            reviews={reviews}
            moderateReview={moderateReview}
            removeReview={removeReview}
          />
        );
    }
  };

  return (
    <motion.div
      className="admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Floating Order Notification Toast */}
      <AnimatePresence>
        {newOrderNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="order-toast-container"
          >
            <div className="order-toast-content">
              <div className="order-toast-header">
                <div className="order-toast-badge-group">
                  <div className="order-toast-icon-bg">🛍️</div>
                  <div>
                    <div className="order-toast-title">
                      {newOrderNotification.count > 1
                        ? `${newOrderNotification.count} New Orders!`
                        : "New Order Received"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="order-toast-close-btn"
                  onClick={() => setNewOrderNotification(null)}
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>

              <div className="order-toast-body">
                <div className="order-toast-row">
                  <span className="order-toast-id">
                    Order {newOrderNotification.id}
                  </span>
                  <span className="order-toast-amount">
                    Rs. {newOrderNotification.total}
                  </span>
                </div>
                <div className="order-toast-row">
                  <span className="order-toast-time">
                    Received at {newOrderNotification.timestamp}
                  </span>
                </div>
              </div>

              <div className="order-toast-actions">
                <button
                  type="button"
                  className="toast-btn-primary"
                  onClick={() => {
                    setNewOrderNotification(null);
                    navigate("/admin/orders");
                  }}
                >
                  View Orders
                </button>
                <button
                  type="button"
                  className="toast-btn-secondary"
                  onClick={() => setNewOrderNotification(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Dashboard</h2>
      </div>

      {message && <div className="alert-banner info">{message}</div>}
      {loadError && <div className="alert-banner danger">{loadError}</div>}

      {loading ? (
        <div className="studio-loading-container">
          <div className="studio-spinner"></div>
          <span className="studio-loading-text">Loading dashboard content...</span>
        </div>
      ) : (
        renderActiveSection()
      )}
    </motion.div>
  );
}