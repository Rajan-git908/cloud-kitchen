import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const storageKey = user?.id ? `cartItems:user:${user.id}` : "cartItems:guest";
  const [loadedKey, setLoadedKey] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cartItems:guest") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const savedItems = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setCartItems(Array.isArray(savedItems) ? savedItems : []);
    } catch {
      setCartItems([]);
    }
    setLoadedKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedKey === storageKey) localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, loadedKey, storageKey]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find((entry) => entry.id === item.id);
      if (exists) {
        return prev.map((entry) => (entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)).filter((item) => item.quantity > 0));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
