import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");
  const { apiBaseUrl } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const data = searchParams.get("data");

    if (data) {
      axios
        .post(`${apiBaseUrl}/api/payment/esewa/verify`, { data })
        .then(() => {
          clearCart();
          setStatus("Payment verified successfully!");
          setTimeout(() => navigate("/dashboard"), 2000);
        })
        .catch((err) => {
          setStatus(err.response?.data?.error || "Verification failed");
        });
    } else {
      setStatus("No verification token received");
    }
  }, [searchParams, apiBaseUrl, clearCart, navigate]);

  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <h2>{status}</h2>
    </div>
  );
}

export default PaymentSuccess;