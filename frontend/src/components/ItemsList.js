import React from 'react';

export default function ItemsList({ items = [], onEdit = () => {}, onDelete = () => {} }) {
  return (
    <div className="items-list">
      <div className="items-table-wrap">
        <table className="items-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5}>No items</td></tr>
            ) : (
              items.map(it => (
                <tr key={it.id}>
                  <td style={{ width: 120 }}><img src={it.image_url || it.image || '/images/placeholder.png'} alt={it.name} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} /></td>
                  <td>{it.name}</td>
                  <td>{it.category_title || it.category_slug || it.category || '—'}</td>
                  <td>Rs. {Number(it.price).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn small" onClick={() => onEdit(it)}>Edit</button>
                      <button className="btn small" onClick={() => onDelete(it.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive card list for small screens */}
      <div className="items-cards">
        {items.map(it => (
          <div key={it.id} className="admin-item">
            <img src={it.image_url || it.image || '/images/placeholder.png'} alt={it.name} width={80} />
            <div className="admin-item-info">
              <strong>{it.name}</strong>
              <div>{it.category_title || it.category_slug || '—'}</div>
              <div>Price: Rs. {Number(it.price).toFixed(2)}</div>
            </div>
            <div className="admin-item-actions">
              <button className="btn small" onClick={() => onEdit(it)}>Edit</button>
              <button className="btn small" onClick={() => onDelete(it.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
