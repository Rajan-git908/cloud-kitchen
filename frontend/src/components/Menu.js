import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import "../App.css";

const menuCategories = ["All", "Main Meals", "Fast Food & Snacks", "Healthy & Diet", "Desserts & Bakery", "Beverages"];

function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addToCart } = useContext(CartContext);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    const normalizedPath = imagePath.replace(/\\/g, "/");
    const imageName = normalizedPath.split("/").pop();
    return `${apiBaseUrl.replace(/\/$/, "")}/images/${encodeURIComponent(imageName)}`;
  };

  useEffect(() => {
    axios.get(`${apiBaseUrl}/api/menu`)
      .then((res) => setMenu(res.data))
      .catch(() => setError("We could not connect to the menu service. Check that the backend is running on port 5000."))
      .finally(() => setLoading(false));
  }, [apiBaseUrl]);

  const visibleMenu = selectedCategory === "All"
    ? menu
    : menu.filter((item) => (item.category || "Main Meals") === selectedCategory);

  return (
    <motion.div 
      className="menu-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="section-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <span className="eyebrow">The daily menu</span>
          <h2>Made fresh, delivered warm.</h2>
        </div>
      </motion.div>
      
      <motion.div 
        className="category-filters" 
        aria-label="Food categories"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {menuCategories.map((category) => (
          <motion.button
            key={category}
            className={`category-filter ${selectedCategory === category ? "active" : ""}`}
            type="button"
            onClick={() => setSelectedCategory(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </motion.div>
      
      {loading && (
        <motion.p 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading today's menu...
        </motion.p>
      )}
      
      {error && (
        <motion.p 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
      
      {!loading && !error && menu.length === 0 && (
        <motion.p 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          The menu is ready for its first dishes. An admin can add items from the studio.
        </motion.p>
      )}
      
      {!loading && !error && menu.length > 0 && visibleMenu.length === 0 && (
        <motion.p 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No dishes are available in this category yet.
        </motion.p>
      )}
      
      <div className="menu-grid">
        {visibleMenu.map((item, index) => (
          <motion.div
            key={item.id}
            className="menu-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -12, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.image_url ? (
              <img 
                src={getImageUrl(item.image_url)} 
                alt={item.name} 
                onError={(event) => { 
                  event.currentTarget.replaceWith(Object.assign(document.createElement("div"), { 
                    className: "menu-image-placeholder", 
                    textContent: "🍽️" 
                  })); 
                }} 
              />
            ) : (
              <div className="menu-image-placeholder">🍽️</div>
            )}
            <div className="menu-card-body">
              <span className="category-tag">{item.category || "Main Meals"}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="price-row">
                <span className="price">Rs. {item.price}</span>
                <motion.button
                  className="btn"
                  onClick={() => addToCart(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Menu;