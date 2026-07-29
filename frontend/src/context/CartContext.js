import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const auth = useAuth();

  // guest id persisted across sessions to separate guest carts per browser
  const getGuestId = () => {
    try {
      let id = localStorage.getItem('guest_id');
      if (!id) {
        id = 'g_' + Date.now() + '_' + Math.floor(Math.random() * 90000 + 10000);
        localStorage.setItem('guest_id', id);
      }
      return id;
    } catch (e) {
      return 'g_fallback';
    }
  };

  const storageKeyFor = (userId) => {
    if (userId) return `cart_items_user_${userId}`;
    return `cart_items_guest_${getGuestId()}`;
  };

  const prevUserId = useRef(auth && auth.user ? auth.user.id : null);
  const [items, setItems] = useState(() => {
    try {
      const userId = auth && auth.user ? auth.user.id : null;
      const key = storageKeyFor(userId);
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Load items for the current user/guest when provider mounts or when auth changes
  useEffect(() => {
    const userId = auth && auth.user ? auth.user.id : null;
    const key = storageKeyFor(userId);
    try {
      const raw = localStorage.getItem(key);
      const loaded = raw ? JSON.parse(raw) : [];
      // If we just logged in (prevUserId was null/guest and now userId exists), try merge guest cart
      if (userId && !prevUserId.current) {
        // merge guest cart into user cart
        try {
          const guestKey = storageKeyFor(null);
          const guestRaw = localStorage.getItem(guestKey);
          const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
          if (Array.isArray(guestItems) && guestItems.length) {
            // merge by id
            const map = {};
            (loaded || []).forEach(it => { map[String(it.id)] = { ...it }; });
            guestItems.forEach(it => {
              const id = String(it.id);
              if (map[id]) {
                map[id].qty = (map[id].qty || 0) + (it.qty || 0);
              } else {
                map[id] = { ...it };
              }
            });
            const merged = Object.values(map);
            setItems(merged);
            // persist merged to user key and clear guest key
            localStorage.setItem(key, JSON.stringify(merged));
            localStorage.removeItem(guestKey);
            prevUserId.current = userId;
            return;
          }
        } catch (mergeErr) {
          console.error('Failed to merge guest cart:', mergeErr);
        }
      }
      // Only set items if they differ to avoid unnecessary writes
      setItems(loaded || []);
    } catch (e) {
      setItems([]);
    }
    prevUserId.current = auth && auth.user ? auth.user.id : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth && auth.user && auth.user.id]);

  // Persist items to the correct storage key when items change
  useEffect(() => {
    const userId = auth && auth.user ? auth.user.id : null;
    const key = storageKeyFor(userId);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items, auth && auth.user && auth.user.id]);

  const addItem = (item) => {
    setItems((prev) => {
      // if item with same id exists, increment qty
      const existing = prev.find((p) => String(p.id) === String(item.id));
      if (existing) {
        return prev.map((p) => (String(p.id) === String(item.id) ? { ...p, qty: (p.qty || 1) + 1 } : p));
      }
      // ensure price is stored as a number
      const price = Number(item.price) || 0;
      const normalized = { ...item, price, qty: 1 };
      // ensure id is a string to avoid collisions between numeric and string ids
      normalized.id = String(normalized.id);
      return [...prev, normalized];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const decrementItem = (id) => {
    setItems((prev) => {
      return prev
        .map((it) => (it.id === id ? { ...it, qty: (it.qty || 1) - 1 } : it))
        .filter((it) => (it.qty || 0) > 0);
    });
  };

  const clear = () => setItems([]);

  const total = items.reduce((s, it) => s + (parseFloat(it.price) || 0) * (it.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, decrementItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
