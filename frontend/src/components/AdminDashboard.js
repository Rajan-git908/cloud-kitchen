
//component/AdminDashboard.js
// it should only handle add, edit,update and delete menu items, and shows customer reviews
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import ReviewSection from "./Admin/ReviewSection";
import MenuSection from "./Admin/MenuSection";
import OrderSection from "./Admin/OrderSection";
import UserSection from "./Admin/UserSection";



const menuCategories = ["Main Meals", "Fast Food & Snacks", "Healthy & Diet", "Desserts & Bakery", "Beverages"];

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


const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      const menuRes = await axios.get(`${apiBaseUrl}/api/menu/admin`, { headers: { Authorization: `Bearer ${token}` } });
      setMenuItems(menuRes.data);
      const ordersRes = await axios.get(`${apiBaseUrl}/api/orders/admin`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(ordersRes.data);
      const reviewsRes = await axios.get(`${apiBaseUrl}/api/reviews/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.error || "Data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [token, apiBaseUrl]);


useEffect(() => {
    if (token) {
      const pollOrders = async () => {
        try {
          const ordersRes = await axios.get(`${apiBaseUrl}/api/orders/admin`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          const currentOrders = ordersRes.data;
          
          if (currentOrders.length > previousOrderCount) {
            const newOrders = currentOrders.slice(0, currentOrders.length - previousOrderCount);
            if (newOrders.length > 0) {
              const latestOrder = newOrders[0];
              setNewOrderNotification({
                id: latestOrder.id,
                total: latestOrder.total,
                timestamp: new Date(latestOrder.created_at).toLocaleTimeString()
              });
            }
          }
          setOrders(currentOrders);
          setPreviousOrderCount(currentOrders.length);
        } catch (err) {
          console.error("Error polling orders:", err);
        }
      };

      loadData();
      const pollInterval = setInterval(pollOrders, 10000);
      return () => clearInterval(pollInterval);
    }
  }, [token, apiBaseUrl, previousOrderCount, loadData]);

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
        await axios.put(`${apiBaseUrl}/api/menu/${editingId}`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        setMessage("Menu item updated successfully!");
      } else {
        await axios.post(`${apiBaseUrl}/api/menu`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
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
      await axios.delete(`${apiBaseUrl}/api/menu/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axios.patch(`${apiBaseUrl}/api/menu/${item.id}/availability`, { is_available: !item.is_available }, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch (err) {
      setMessage("Unable to update item visibility");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${apiBaseUrl}/api/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const moderateReview = async (review, approved) => {
    await axios.put(`${apiBaseUrl}/api/reviews/${review.id}`, { approved, rating: review.rating, text: review.text }, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const removeReview = async (id) => {
    await axios.delete(`${apiBaseUrl}/api/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
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

  const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
            name={name} setName={setName}
            price={price} setPrice={setPrice}
            description={description} setDescription={setDescription}
            category={category} setCategory={setCategory}
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
      className="container py-4 dashboard-page admin-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AnimatePresence>
        {newOrderNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed top-10 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-2xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-full">🛒</div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">New Order Received!</h4>
                <p className="text-sm opacity-90 mb-2">Order #{newOrderNotification.id} : Rs.{newOrderNotification.total}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setNewOrderNotification(null);
                navigate("/admin/orders");
              }} 
              className="mt-4 w-full bg-white/20 py-2 rounded-lg font-semibold"
            >
              View Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <h2>Admin Dashboard</h2>
      {message && <div className="alert alert-info">{message}</div>}
      {loadError && <div className="alert alert-danger">{loadError}</div>}

      {loading ? (
        <p className="studio-loading">Loading dashboard...</p>
      ) : (
        renderActiveSection()
      )}
    </motion.div>
  );
}




