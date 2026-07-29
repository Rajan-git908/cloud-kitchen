import React from 'react';
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";

// styles moved to src/App.css

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col about">
          <h4>About Us</h4>
          <p>CloudKitchen brings delicious meals from local kitchens to your door. Fast delivery, curated menus, and fresh ingredients.</p>
        </div>

        <div className="footer-col contact">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:support@cloudkitchen.example">support@cloudkitchen.com</a></p>
          <p>Phone: <a href="tel:+9779819877891">+977 9819877891</a></p>
        </div>

        <div className="footer-col follow">
          <h4>Follow Us</h4>
          <div className="socials">
            <a href="https://www.facebook.com/share/1GFL1Zwbcy/" aria-label="facebook" className="social"><FaFacebook color="#0051ffff" size={30} /></a>
            <a href="https://wa.me/qr/2QMSSNY7QPVRI1" aria-label="whatsapp" className="social"><FaWhatsapp color="#25D366" size={30} /></a>
            <a href="https://www.instagram.com/sharmarajan980?igsh=ODRydzN4Ym5qNDB0" aria-label="instagram" className="social"><FaInstagram color="#C13584" size={30} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} CloudKitchen — All rights reserved.</small>
      </div>
    </footer>
  );
}

export default Footer;
