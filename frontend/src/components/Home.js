import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Review from "./Review";

function Home() {
  return (
    <>
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="eyebrow">Small kitchen. Big feeling.</span>
          <h1>Good food should feel like a little event.</h1>
          <p>Thoughtful plates, bright ingredients, and fast delivery from our kitchen to your table.</p>
          <div className="hero-actions">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/menu" className="button-secondary" style={{ textDecoration: "none" }}>Explore the menu</Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/register" className="button-primary" style={{ textDecoration: "none" }}>Create an account</Link>
            </motion.div>
          </div>
          <div className="hero-proof">
            <span>★ 4.9 customer rating</span>
            <span>•</span>
            <span>Warm delivery, every day</span>
          </div>
        </motion.div>
        <motion.div 
          className="hero-plate"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="plate">🍜</div>
        </motion.div>
      </motion.div>

      <section className="page-wrap home-intro">
        <motion.div 
          className="section-heading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="eyebrow">Made for tonight</span>
            <h2>Find your next favorite.</h2>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/menu" className="button-primary" style={{ textDecoration: "none" }}>See all dishes</Link>
          </motion.div>
        </motion.div>
        
        <div className="feature-grid">
          <motion.article 
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8 }}
          >
            <span className="feature-number">01</span>
            <h3>Cooked with intent</h3>
            <p>Small-batch recipes, balanced flavors, and ingredients that get to be the main character.</p>
          </motion.article>
          
          <motion.article 
            className="feature-card feature-card-dark"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <span className="feature-number">02</span>
            <h3>At your door, warm</h3>
            <p>We keep the handoff simple, thoughtful, and quick, so dinner still feels like dinner.</p>
          </motion.article>
          
          <motion.article 
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8 }}
          >
            <span className="feature-number">03</span>
            <h3>A little extra joy</h3>
            <p>Save your favorites, build your order, and make an ordinary evening taste considered.</p>
          </motion.article>
        </div>
      </section>

      <motion.section 
        className="kitchen-story-image"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
    >
        <motion.div 
          className="kitchen-story-copy"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="eyebrow">About our kitchen</span>
          <h2>Made close to home, meant to be shared.</h2>
          <p>Cloud Kitchen is a small, focused kitchen built around generous food and dependable delivery. We choose ingredients with care, cook in small batches, and keep the menu lively without making dinner complicated.</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/menu" className="button-secondary" style={{ textDecoration: "none" }}>Meet the menu</Link>
          </motion.div>
        </motion.div>
      </motion.section>

      <Review />
    </>
  );
}

export default Home;
