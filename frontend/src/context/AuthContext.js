import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const id = localStorage.getItem('mock_user_id');
    if (!id) return null;
    return {
      id,
      name: localStorage.getItem('mock_user_name') || null,
      phone: localStorage.getItem('mock_user_phone') || null,
      role: localStorage.getItem('mock_user_role') || null
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mock_user_id', user.id);
      localStorage.setItem('mock_user_name', user.name || '');
      localStorage.setItem('mock_user_phone', user.phone || '');
      localStorage.setItem('mock_user_role', user.role || 'user');
    }
  }, [user]);

  const login = (userObj) => {
    setUser(userObj);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user_id');
    localStorage.removeItem('mock_user_name');
    localStorage.removeItem('mock_user_phone');
    localStorage.removeItem('mock_user_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
