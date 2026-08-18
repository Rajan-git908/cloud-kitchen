import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { token, user, apiBaseUrl } = useContext(AuthContext);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect guest users to /login page
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const placeOrder = async () => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      // Format payload items to align with order_items schema
      const itemsPayload = cartItems.map((item) => ({
        menu_id: item.id,
        qty: item.quantity,
        price: Number(item.price),
      }));

      await axios.post(
        `${apiBaseUrl}/api/orders`,
        { total, items: itemsPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearCart();
      setStatus("Order confirmed. Your kitchen is on it.");
    } catch (error) {
      setStatus(
        error.response?.data?.error ||
          (error.code === "ERR_NETWORK"
            ? "The kitchen service is offline. Please start the backend and try again."
            : "We could not place that order.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <motion.main
      className="page-wrap checkout-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="eyebrow">Almost there</span>
        <h1>Review your order.</h1>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.p className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Your cart is empty.{" "}
          <motion.button
            className="button-quiet"
            onClick={() => navigate("/menu")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse the menu
          </motion.button>
        </motion.p>
      ) : (
        <motion.div
          className="checkout-panel surface"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="customer-info-preview mb-3">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Ordering as:</strong> {user?.full_name || user?.name} ({user?.phone})
            </p>
          </div>

          <div className="checkout-items">
            {cartItems.map((item, index) => (
              <motion.div
                className="summary-line"
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <span>
                  {item.name} <small>x {item.quantity}</small>
                </span>
                <strong>Rs. {(Number(item.price) * item.quantity).toFixed(2)}</strong>
              </motion.div>
              
            ))}
          </div>
          <div className="summary-line">
            <strong> Delivery Charge</strong>
            <strong>Rs. 150 </strong>
            </div>
            <hr></hr>
          <div className="summary-total">
            <span>Total</span>
            <strong>Rs. {(Number(total)+150).toFixed(2)}</strong>
          </div>
          <motion.button
            className="button-primary checkout-button"
            onClick={placeOrder}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Placing order..." : "Place order"}
          </motion.button>
        </motion.div>
      )}

      {status && (
        <motion.p
          className="order-status"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {status}
        </motion.p>
      )}
    </motion.main>
  );
}

export default Checkout;