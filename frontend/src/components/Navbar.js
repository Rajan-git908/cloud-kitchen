import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import "../App.css";
import logo from "../Image/logo512.png";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.navbar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
        <img className="brand-logo" src={logo} alt="Cloud Kitchen logo" />
        Cloud Kitchen
      </Link>

      <button
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {user && user.role === "admin" ? (
          /* Admin Navigation */
          <>
            <Link to="/admin" className="nav-link" onClick={closeMobileMenu}> Dashboard</Link>
            <Link to="/admin/users" className="nav-link" onClick={closeMobileMenu}> Users</Link>
            <Link to="/admin/orders" className="nav-link" onClick={closeMobileMenu}> Orders</Link>
            <Link to="/admin/menu" className="nav-link" onClick={closeMobileMenu}>  Menu</Link>
            <Link to="/profile" className="nav-link" onClick={closeMobileMenu}> My Profile</Link>
          </>
        ) : (
          /* Regular User & Guest Navigation */
          <>
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
            <Link to="/menu" className="nav-link" onClick={closeMobileMenu}>Menu</Link>
            <Link to="/cart" className="nav-link" onClick={closeMobileMenu}>
              Cart {cartItems.length > 0 ? `(${cartItems.length})` : ""}
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}> Dashboard</Link>
                <Link to="/profile" className="nav-link" onClick={closeMobileMenu}> My Profile </Link>
              </>
            )}
          </>
        )}

        {/* Guest Action Links */}
        {!user && (
          <>
            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>Sign in</Link>
            <Link to="/register" className="nav-cta" onClick={closeMobileMenu}>Join us</Link>
          </>
        )}

        {/* Logged In User Greeting & Actions */}
        {user && (
          <>
            <span className="nav-user">Hi, {user.name || user.full_name}</span>
            <button className="button-quiet" onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;