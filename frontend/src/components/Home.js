import React from 'react';
import { Link } from 'react-router-dom';
// styles moved to src/App.css
import Menu from './Menu';

const Home = () => {
  return (
    <>
      <header className="home-hero">
        <h1>Welcome to CloudKitchen</h1>
        <p>Explore curated food groups — pick a category and order in seconds.</p>
        <div className="hero-actions">
          <Link to="/menu" className="btn ghost">Browse Menu</Link>
          <Link to="/cart" className="btn">View Cart</Link>
        </div>
      </header>
      <Menu />
    </>
  )
}

export default Home