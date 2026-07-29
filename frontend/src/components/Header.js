import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// styles moved to src/App.css

function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // no local user state; derive directly from auth
  useEffect(() => {
    // close nav on route change
    setOpen(false);
  }, [location]);

  const handleLogout = () => {
    if (auth) auth.logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className='header-inner'>
        <div className='logo'>
          <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="cloudkitchen" className="logo-img" />
          <span className="brand">cloudkitchen</span>
        </div>

        <button className="nav-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((s) => !s)} aria-label="Toggle navigation">☰</button>

        <nav id="main-nav" className={open ? 'open' : ''} onClick={() => setOpen(false)}>
          <div className="nav-left">
            <Link to="/">Home</Link>
            <Link to="/about-us">About Us</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="nav-right">
            {auth && auth.user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                {((auth.user.role === 'admin') || (auth.user.role === 'owner')) && <Link to="/admin">Admin</Link>}
                <a href="#" className="nav-logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;