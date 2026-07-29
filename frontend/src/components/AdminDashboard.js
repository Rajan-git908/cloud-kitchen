import React, { useEffect, useState } from "react";
import OrdersList from './OrdersList';
import ItemsList from './ItemsList';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name: "", price: "", category_id: "", image_url: "" });

  // Fetch categories + items from backend
  useEffect(() => {
    // redirect non-admin users away from this page
    if (!auth || !auth.user || auth.user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategories);

    fetch("/api/items")
      .then(res => res.json())
      .then(setItems);
  }, []);

  const startAdd = () => {
    setEditing(null);
    setForm({ name: "", price: "", category_id: "", image_url: "" });
  };

  const startEdit = (it) => {
    setEditing(it.id);
    setForm({ name: it.name, price: it.price, category_id: it.category_id, image_url: it.image_url });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) return;

    const headers = { "Content-Type": "application/json" };
    if (auth && auth.user && auth.user.id) headers['x-user-id'] = auth.user.id;

    if (editing) {
      await fetch(`/api/items/${editing}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form)
      });
    } else {
      const res = await fetch("/api/items", {
        method: "POST",
        headers,
        body: JSON.stringify(form)
      });
      const newItem = await res.json();
      setItems(prev => [newItem, ...prev]);
      setSuccessMsg("Item added successfully!");
    }

    setEditing(null);
    setForm({ name: "", price: "", category_id: "", image_url: "" });
    // Refresh items
    fetch("/api/items")
      .then(res => res.json())
      .then(setItems);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    const headers = { 'Content-Type': 'application/json' };
    if (auth && auth.user && auth.user.id) headers['x-user-id'] = auth.user.id;
    await fetch(`/api/items/${id}`, { method: "DELETE", headers });
    setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="admin-dashboard container">
      <h2>Admin Dashboard</h2>
      <div className="admin-controls">
      <button className="btn small" onClick={ startAdd}>Add Item</button>
      </div>

      <form className="admin-form" onSubmit={save}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />

        {/* Dropdown for categories */}
        <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.slug}</option>
          ))}
        </select>

        <input placeholder="/images/name.png" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <button className="btn small">Save</button>
      </form>

      <div style={{ marginTop: 12 }}>
        <ItemsList items={items} onEdit={startEdit} onDelete={remove} />
      </div>
      <div className="admin-orders">
        <h3>All Orders</h3>
        <p>Manage orders below.</p>
        <div style={{ marginTop: '12px' }}>
          <OrdersList showActions={true} showFilters={true} includeItems={true} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;