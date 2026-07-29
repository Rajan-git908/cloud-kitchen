import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// Cart uses CartContext
function Cart() {
  const { items, removeItem, decrementItem, addItem, clear, total } = useCart();
  const navigate = useNavigate();
  const goToCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
    //alert('Order placed! Total: RS. ' + total.toFixed(2));
    //clear();
  };

  return (
    <div className="cart page">
      <h2> My Cart</h2>
      {items.length === 0 ? (
        <p className="muted">Cart is empty.</p>
      ) : (
        <div className="cart-list">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-left">
                <div className="cart-name">{item.name}</div>
                <div className="cart-price">RS. {Number(item.price).toFixed(2)}</div>
              </div>
              <div className="cart-controls">
                <button className="qty-btn" aria-label={`Decrease ${item.name}`} onClick={() => decrementItem(item.id)}>-</button>
                <span className="qty">{item.qty || 1}</span>
                <button className="qty-btn" aria-label={`Increase ${item.name}`} onClick={() => addItem(item)}>+</button>
                <button className="btn small" onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="cart-total">Total: <strong>Rs. {Number(total).toFixed(2)}</strong></div>
          <div className="cart-actions">
            <button onClick={goToCheckout} className="btn">Place Order</button>
            <button onClick={clear} className="btn ghost">Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;