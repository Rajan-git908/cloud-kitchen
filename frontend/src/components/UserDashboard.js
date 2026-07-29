import React, { useEffect, useState } from 'react';
import Cart from './Cart';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import OrdersList from './OrdersList';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [me, setMe] = useState({id:'', name: '',  phone: '',  role: '' });

  useEffect(() => {
    if (auth && auth.user) {
      setMe({ id: auth.user.id || '', name: auth.user.name || '', phone: auth.user.phone || '', role: auth.user.role || '' });
    } else {
      setMe({ id: '', name: '', phone: '', role: '' });
    }
  }, [auth]);


  return (
    <div className="user-dashboard container">
      <div className="dashboard-header">
        <h2>My Dashboard</h2>
          <div className="role-badge">Role: <strong>{me.role}</strong></div>   
      </div>

      <div className="dashboard-grid">
        <section className="profile card">
          <h3>Profile</h3>
          <div>Id: {me.id || '—'}</div>

          <div>Name: {me.name || '—'}</div>
          <div>Phone: {me.phone || '—'}</div>
        </section>
        

        <section className="orders card">
          <h3>Order History</h3>
          <OrdersList userOnly={true} userId={me.id} userView={true} />
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
