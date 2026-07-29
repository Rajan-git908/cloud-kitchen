import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';

function Menu() {
  const { addItem } = useCart();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    //;
axios.get("/api/items")      
.then((response) => {        
  const dbItems = response.data;        // Group items by category_id        
const grouped = {};        
dbItems.forEach((item) => {          
  const catId = item.category_id;                    
  const catTitle = item.category_title;              
  if (!grouped[catId]) {            
    grouped[catId] = { id: catId, title: catTitle, items: [] };          
  }         
   grouped[catId].items.push({            
    id: item.id,            
    name: item.name,            
    price: item.price,            
    image: item.image_url || '/images/placeholder.png',          
  });        
});        
setGroups(Object.values(grouped));      
})      
.catch((error) => {        
  console.error("Error fetching items:", error);
  });
  }, []);

  return (
    <div className="menu page">
      <h2 className="menu-title">Menu</h2>
      <main className="groups">
        {groups.map((g) => (
          <section key={g.id} className="group">
            <h2 className="group-title">{g.title}</h2> 
            <div className="group-grid">
              {g.items.map((it, idx) => (
                <article key={it.id} className="group-card" style={{ animationDelay: `${idx * 70}ms` }}>
                  <div className="group-img">
                    <img src={it.image} alt={it.name} loading="lazy" />
                    <div className="group-price">Rs. {Number(it.price).toFixed(2)}</div>
                  </div>
                  <div className="group-body">
                    <h3>{it.name}</h3>
                    <div className="group-actions">
                      <button
                        className="btn add"
                        aria-label={`Add ${it.name} to cart`}
                        onClick={() => {
                          addItem(it);
                          const t = document.createElement('div');
                          t.className = 'menu-toast';
                          t.textContent = `${it.name} added to cart`;
                          document.body.appendChild(t);
                          setTimeout(() => t.classList.add('visible'), 10);
                          setTimeout(() => {
                            t.classList.remove('visible');
                            setTimeout(() => { try { document.body.removeChild(t); } catch(e){} }, 300);
                          }, 1400);
                        }}
                      >Add</button>
                      <Link to={`/menu/${it.id}`} className="link small">More</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default Menu;