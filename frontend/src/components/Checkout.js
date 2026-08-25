/* 
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

  // State for coordinates and delivery address
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // Redirect guest users to /login page
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
// Geolocation handler
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLocationLoading(false);
        },
        (error) => {
          setLocationLoading(false);
          alert("Could not fetch location. Please enable location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };



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
        { 
          total, 
          items: itemsPayload,
          latitude: location.latitude,
          longitude: location.longitude,
          delivery_address: deliveryAddress || user?.location || ""
        },
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

// Delivery Location Input Section 
          <div className="delivery-location-section mb-3">
            <label className="d-block mb-1 text-sm font-semibold">Delivery Address:</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter building / landmark / street address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleGetLocation}
              disabled={locationLoading}
            >
              {locationLoading
                ? "Fetching location..."
                : location.latitude
                ? " Location Attached"
                : " Pin Live Location"}
            </button>
            {location.latitude && (
              <small className="d-block text-success mt-1">
                Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
              </small>
            )}
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

*/


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

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const grandTotal = total + 150; // Including delivery charge

  // Dynamic eSewa HTML Form Auto-Submitter
  const submitToEsewa = (esewaData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaData.esewa_url;

    const fields = {
      amount: esewaData.amount,
      tax_amount: esewaData.tax_amount,
      total_amount: esewaData.total_amount,
      transaction_uuid: esewaData.transaction_uuid,
      product_code: esewaData.product_code,
      product_service_charge: esewaData.product_service_charge,
      product_delivery_charge: esewaData.product_delivery_charge,
      success_url: esewaData.success_url,
      failure_url: esewaData.failure_url,
      signed_field_names: esewaData.signed_field_names,
      signature: esewaData.signature,
    };

    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const hiddenField = document.createElement("input");
        hiddenField.type = "hidden";
        hiddenField.name = key;
        hiddenField.value = fields[key];
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  };

  const placeOrder = async () => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const itemsPayload = cartItems.map((item) => ({
        menu_id: item.id,
        qty: item.quantity,
        price: Number(item.price),
      }));

      const targetAddress = deliveryAddress || user?.location || "Standard Delivery";

      // 1. Save Order in Database first
      const orderRes = await axios.post(
        `${apiBaseUrl}/api/orders`,
        { 
          total: grandTotal, 
          items: itemsPayload,
          delivery_address: targetAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderRes.data.id;

      // 2. Process based on selected payment method
      if (paymentMethod === "ESEWA") {
        const payRes = await axios.post(
          `${apiBaseUrl}/api/payment/esewa/initiate`,
          { order_id: orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Redirect to eSewa Portal via Form Submission
        submitToEsewa(payRes.data);
      } else {
        // Cash on Delivery Option
        clearCart();
        setStatus("Order confirmed. Your kitchen is on it.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Order placement failed:", error.response || error);
      setStatus(
        error.response?.data?.error ||
          (error.code === "ERR_NETWORK"
            ? "The kitchen service is offline. Please start backend server."
            : "We could not place that order.")
      );
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <motion.main className="page-wrap checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <span className="eyebrow">Almost there</span>
        <h1>Review your order.</h1>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-state">Cart is empty. Browse the menu first.</p>
      ) : (
        <div className="checkout-panel surface">
          <div className="delivery-location-section mb-3">
            <label className="d-block mb-1 text-sm font-semibold">Delivery Address:</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Enter street address or landmark"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="checkout-items">
            {cartItems.map((item) => (
              <div className="summary-line" key={item.id}>
                <span>{item.name} <small>x {item.quantity}</small></span>
                <strong>Rs. {(Number(item.price) * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-line">
            <strong>Delivery Charge</strong>
            <strong>Rs. 150.00</strong>
          </div>
          <hr />

          <div className="payment-options mb-3">
            <label className="d-block mb-2 text-sm font-semibold">Payment Method:</label>
            <div className="d-flex gap-3">
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                /> Cash on Delivery
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="ESEWA"
                  checked={paymentMethod === "ESEWA"}
                  onChange={() => setPaymentMethod("ESEWA")}
                /> eSewa Wallet
              </label>
            </div>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>Rs. {grandTotal.toFixed(2)}</strong>
          </div>

          <button className="button-primary checkout-button" onClick={placeOrder} disabled={loading}>
            {loading ? "Processing..." : paymentMethod === "ESEWA" ? "Pay with eSewa" : "Place Order"}
          </button>
        </div>
      )}

      {status && <p className="order-status">{status}</p>}
    </motion.main>
  );
}

export default Checkout;