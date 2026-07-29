import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Auth from './components/Auth';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Checkout from './components/Checkout';
import { CartProvider } from './context/CartContext';
import Chatbot from './components/Chatbot';



function App() {
  return (
    <Router>
      <CartProvider>
        <div className="app-root">
          <Header />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Auth initial="login" />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;