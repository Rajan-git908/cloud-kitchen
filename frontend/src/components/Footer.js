import React from "react";
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col about">
          <span className="footer-kicker">Cloud Kitchen</span><h4>Good food, thoughtfully sent.</h4>
          <p>Meals with a little more care, from our kitchen to your table. Fresh ingredients, warm delivery, and no unnecessary fuss.</p>
        </div>

        <div className="footer-col contact">
          <h4>Come say hello</h4>
          <p>Email: <a href="mailto:support@cloudkitchen.example">support@cloudkitchen.com</a></p>
          <p>Email: <a href="mailto:support@cloudkitchen.example">studentrajan908@gmail.com</a></p>
          <p>Phone: <a href="tel:+9779819877891">+977 9819877891</a></p>
        </div>

        <div className="footer-col follow">
          <h4>Follow the feeling</h4>
          <div className="socials">
            <a href="https://www.facebook.com/share/1GFL1Zwbcy/" aria-label="facebook" className="social"><FaFacebook color="#0051ffff" size={30} /></a>
            <a href="https://wa.me/qr/2QMSSNY7QPVRI1" aria-label="whatsapp" className="social"><FaWhatsapp color="#25D366" size={30} /></a>
            <a href="https://www.instagram.com/sharmarajan980?igsh=ODRydzN4Ym5qNDB0" aria-label="instagram" className="social"><FaInstagram color="#C13584" size={30} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} CloudKitchen — All Right Reserved. (Rajan Kumar Thakur)</small>
              </div>
    </footer>
  );
}

export default Footer;
