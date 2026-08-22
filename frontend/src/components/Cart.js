import React, { useContext } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Cart({ onPlaceOrder, tableMode = false }) {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <motion.div 
      className="page-wrap cart-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="eyebrow">Your selection</span>
        <h1>Your cart</h1>
      </motion.div>
      
      {cartItems.length === 0 ? (
        <motion.div 
          className="empty-panel"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="empty-icon">✦</span>
          <h3>Your table is waiting.</h3>
          <p>Add a few dishes and we'll take it from there.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link className="button-primary" to="/menu">Browse the menu</Link>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="cart-layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <div className="cart-note">
              <span className="eyebrow">Your evening, assembled</span>
              <p>Adjust portions freely. We'll keep everything warm and moving.</p>
            </div>
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="surface cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3>{item.name}</h3>
                  {item.image_url ? (
                    <img 
                      src={`${process.env.REACT_APP_API_BASE_URL || "https://cloud-kitchen-l1m5.onrender.com"}${item.image_url}`} 
                      alt="" 
                    />
                  ) : (
                    <div className="cart-thumb">🍽️</div>
                  )}
                  <div className="cart-item-info">
                    
                    <p>Rs. {item.price} each</p>
                    <div className="quantity-control">
                      <motion.button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease ${item.name}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        -
                      </motion.button>
                      <span>{item.quantity}</span>
                      <motion.button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase ${item.name}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        +
                      </motion.button>
                    </div>
                    <motion.button 
                      className="remove-button" 
                      onClick={() => removeFromCart(item.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </motion.button>
                  </div>
                  <strong className="cart-item-total">
                    Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                  </strong>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.aside 
            className="cart-summary surface"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="eyebrow">Order summary</span>
            <h3>Ready when you are.</h3>
            <div className="summary-line">
              <span>Subtotal</span>
              <strong>Rs. {total.toFixed(2)}</strong>
            </div>
            <div className="summary-line">
              <span>Delivery Charge</span>
              <span className="free-label">Rs. 150</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>Rs. {(Number(total)+150).toFixed(2)}</strong>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tableMode && onPlaceOrder ? (
                <button 
                  className="button-primary checkout-button" 
                  onClick={() => onPlaceOrder(cartItems)}
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Place Order
                </button>
              ) : (
                <Link className="button-primary checkout-button" to={token ? "/checkout" : "/login"} style={{ textDecoration: "none" }}>
                  Continue to checkout
                </Link>
              )}
            </motion.div>
          </motion.aside>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Cart;
