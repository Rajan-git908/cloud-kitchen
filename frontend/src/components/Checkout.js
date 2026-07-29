import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, total, clear } = useCart();

  const [address, setAddress] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const auth = useAuth();

  const buildOrderPayload = () => ({
    user_id: (auth && auth.user && auth.user.id) || localStorage.getItem('mock_user_id') || null,
    guest_name: guestName,
    guest_phone: guestPhone,
    guest_email: guestEmail,
    address,
    items: items.map(it => ({ item_id: it.id, qty: it.qty, price: it.price }))
  });

  const placeOrderCOD = async () => {
    if (items.length === 0) return setMsg('Cart is empty');
    if (!address) return setMsg('Address required');

    setLoading(true);
    try {
      const payload = { ...buildOrderPayload(), paymentMethod: 'cod' };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Order placed! ID: ${data.orderId}, Total: Rs. ${data.total}`);
        clear();
      } else {
        setMsg(data.message || 'Order failed');
      }
    } catch (err) {
      console.error(err);
      setMsg('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const payWithKhalti = () => {
    if (items.length === 0) return setMsg('Cart is empty');
    if (!address) return setMsg('Address required');

    if (typeof window === 'undefined' || !window.KhaltiCheckout) {
      return setMsg('Khalti checkout not loaded');
    }

    const productIdentity = Date.now().toString();
    const config = {
      publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY || 'test_public_key_xxx',
      productIdentity,
      productName: 'Food Order',
      productUrl: window.location.origin + '/cart',
      eventHandler: {
        onSuccess: async (payload) => {
          setLoading(true);
          try {
            // payload.amount is expected in paisa (smallest unit)
            const serverPayload = {
              ...buildOrderPayload(),
              paymentMethod: 'khalti',
              paymentToken: payload.token,
              amount: payload.amount
            };
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(serverPayload)
            });
            const data = await res.json();
            if (data.success) {
              setMsg(`Payment & order successful! ID: ${data.orderId}`);
              clear();
            } else {
              setMsg(data.message || 'Order failed after payment');
            }
          } catch (err) {
            console.error(err);
            setMsg('Server error after payment');
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error('Khalti error', err);
          setMsg('Payment failed');
        },
        onClose: () => {
          // optional
        }
      }
    };

    try {
      const checkout = new window.KhaltiCheckout(config);
      // Khalti expects amount in paisa; multiply by 100 and round
      const amountPaisa = Math.round(total * 100);
      checkout.show({ amount: amountPaisa });
    } catch (err) {
      console.error('Khalti checkout init failed', err);
      setMsg('Failed to open payment widget');
    }
  };
 

    return (
    <div className="checkout">
      <h2>Checkout</h2>
      <textarea
        className="form-control"
        placeholder="Delivery address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      {! (auth && auth.user && auth.user.id) && (
        <>
          <input className="form-control" placeholder="Guest name" value={guestName} onChange={e => setGuestName(e.target.value)} />
          <input className="form-control" placeholder="Guest phone" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
          <input className="form-control" placeholder="Guest email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} />
        </>
      )}
      <div>Total: Rs. {total.toFixed(2)}</div>
      {msg && <div>{msg}</div>}
      <div className="checkout-actions" style={{ marginTop: '8px' }}>
        <button className="btn" onClick={payWithKhalti} disabled={loading}>Pay with Khalti</button>
        
        <button className="btn" onClick={placeOrderCOD} disabled={loading}>{loading ? 'Processing…' : 'Place Order (COD)'}</button>
      </div>
    </div>
  );
}