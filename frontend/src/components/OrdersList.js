// OrdersList.js — responsive table view with search and status filter
import React, { useEffect, useState } from 'react';

export default function OrdersList({ userOnly = false, userId = null, statuses = [], showActions = false, showFilters = false, userView = false, includeItems = false }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // UI filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Ensure we send the logged-in user's id. If parent didn't provide one,
      // fall back to the stored `mock_user_id` (used by the AuthContext).
      const effectiveUserId = userOnly ? (userId || localStorage.getItem('mock_user_id')) : userId;
      if (userOnly && effectiveUserId) params.append('user_id', effectiveUserId);
      // prefer UI status filter; fallback to prop statuses
      const statusesToSend = statusFilter ? [statusFilter] : (Array.isArray(statuses) && statuses.length ? statuses : []);
      if (statusesToSend.length) params.append('status', statusesToSend.join(','));
      // If caller wants item details, ask server to include items
      if (includeItems || userOnly || userView) params.append('include_items', '1');
      const url = '/api/orders' + (params.toString() ? `?${params.toString()}` : '');
      const res = await fetch(url);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOnly, userId, JSON.stringify(statuses), statusFilter]);

  const updateStatus = async (id, status) => {
    setStatusUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  };

  // client-side search against id, guest name, guest phone, or user_id
  const filtered = orders.filter(o => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return String(o.id).includes(s) || (o.guest_name && o.guest_name.toLowerCase().includes(s)) || (o.guest_phone && String(o.guest_phone).includes(s)) || (o.user_id && String(o.user_id).includes(s));
  });

  return (
    <div className="orders container">
      <div className="orders-header">
       <h2>  Orders</h2>
        {showFilters && (
          <div className="orders-toolbar">
            <input
              aria-label="Search orders"
              className="form-control"
              placeholder="Search by order id, name, phone or user id"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>Reset</button>
          </div>
        )}
      </div>

      {loading && <div>Loading…</div>}

      {/* Table for larger screens */}
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Items</th>
              {/* Admin columns: Customer (name) and Number (phone) */}
              {!userView && <th>Customer</th>}
              {!userView && <th>Number</th>}
              <th>Address</th>
              <th>Total</th>
              <th>Status</th>
              {showActions && <th>Actions</th>}
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={showActions ? 8 : 7}>No orders</td></tr>
            ) : (
              filtered.map(o => (
                <React.Fragment key={o.id}>
                  <tr className="order-row">
                    <td>{o.id}</td>
                    <td>
                      {Array.isArray(o.items) && o.items.length ? (
                        <button className="btn small" onClick={() => setExpanded(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])}>
                          {expanded.includes(o.id) ? 'Hide items' : `${o.items.length} item(s)`}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                      {/* Customer name / phone columns for admin */}
                      {!userView && (
                        <td>{o.user_name || o.guest_name || 'Guest'}</td>
                      )}
                      {!userView && (
                        <td>{o.user_phone || o.guest_phone || '—'}</td>
                      )}
                      <td className="order-address">{o.address || '—'}</td>
                    <td>Rs. {Number(o.total).toFixed(2)}</td>
                    <td><span className={`order-status ${o.status}`}>{o.status}</span></td>
                    {showActions && (
                      <td className="order-actions-cell">
                        <div className="order-actions">
                          {o.status === 'pending' && (
                            <button onClick={() => updateStatus(o.id, 'approved')} disabled={statusUpdating === o.id}>Approve</button>
                          )}
                          {o.status === 'approved' && (
                            <button onClick={() => updateStatus(o.id, 'dispatched')} disabled={statusUpdating === o.id}>Dispatch</button>
                          )}
                          {o.status === 'dispatched' && (
                            <button onClick={() => updateStatus(o.id, 'delivered')} disabled={statusUpdating === o.id}>Mark Delivered</button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="date">{o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</td>
                  </tr>
                  {expanded.includes(o.id) && Array.isArray(o.items) && (
                    <tr className="order-items-row">
                      <td colSpan={showActions ? 8 : 7}>
                        <div className="order-items-list">
                          {o.items.map(it => (
                            <div key={it.id} className="order-item">
                              <strong>{it.item_name || 'Item'}</strong>
                              <span style={{ marginLeft: 8 }}>Qty: {it.qty}</span>
                              <span style={{ marginLeft: 8 }}>Rs. {Number(it.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card list for small screens */}
      <div className="orders-cards">
        {(!loading && filtered.length === 0) ? <div>No orders</div> : (
          filtered.map(o => (
            <div key={o.id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <strong>Order {o.id}</strong>
                  <div className="muted date">{o.created_at ? new Date(o.created_at).toLocaleString() : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Rs. {Number(o.total).toFixed(2)}</div>
                  <div style={{ marginTop: 6 }}><span className={`order-status ${o.status}`}>{o.status}</span></div>
                </div>
              </div>
 
                         
                      
              <div style={{ marginTop: 8 }}>By: {o.user_id ? ` ${o.user_name}` : `${o.guest_name || ''} `}</div>
              <div style={{ marginTop: 8 }}>Phone: {o.user_id ? o.user_phone : o.guest_phone}</div>
              <div style={{ marginTop: 6, marginBottom: 8 }} className="order-address">Address: {o.address}</div>

              {Array.isArray(o.items) && o.items.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <button className="btn small" onClick={() => setExpanded(prev => prev.includes(o.id) ? prev.filter(x => x !== o.id) : [...prev, o.id])}>
                    {expanded.includes(o.id) ? 'Hide items' : `${o.items.length} item(s)`}
                  </button>
                </div>
              )}

              {expanded.includes(o.id) && Array.isArray(o.items) && (
                <div className="order-items-list">
                  {o.items.map(it => (
                    <div key={it.id} className="order-item">
                      <strong>{it.item_name || 'Item'}</strong>
                      <span style={{ marginLeft: 8 }}>Qty: {it.qty}</span>
                      <span style={{ marginLeft: 8 }}>Rs. {Number(it.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {showActions && (
                <div className="order-actions" style={{ marginTop: 8 }}>
                  {o.status === 'pending' && (
                    <button onClick={() => updateStatus(o.id, 'approved')} disabled={statusUpdating === o.id}>Approve</button>
                  )}
                  {o.status === 'approved' && (
                    <button onClick={() => updateStatus(o.id, 'dispatched')} disabled={statusUpdating === o.id}>Dispatch</button>
                  )}
                  {o.status === 'dispatched' && (
                    <button onClick={() => updateStatus(o.id, 'delivered')} disabled={statusUpdating === o.id}>Mark Delivered</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}