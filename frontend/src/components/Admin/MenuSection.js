//component/Admin/MenuSection.js
// it should display  handle menu management
import React from "react";
import { motion } from "framer-motion";

export default function MenuSection({
  menuItems,
  apiBaseUrl,
  startEdit,
  toggleAvailability,
  removeItem,
  handleSubmit,
  editingId,
  name, setName,
  price, setPrice,
  description, setDescription,
  category, setCategory,
  setImage,
  menuCategories
}) {
  return (
    <div id="menu">

      {/* Form for Add/Edit Item */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="card p-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>{editingId ? "Edit Menu Item" : "Add New Menu Item"}</h4>
        <input className="form-control mb-2" type="text" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="form-control mb-2" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select className="form-select mb-2" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Food category">
          {menuCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input className="form-control mb-2" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        <motion.button 
          className="btn btn-primary" 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {editingId ? "Save Changes" : "Add Menu Item"}
        </motion.button>
      </motion.form>

      <motion.div 
        className="card p-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>Menu Management <span className="section-count">{menuItems.length}</span></h4>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.length ? (
                menuItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-item">
                        {item.image_url ? (
                          <img className="admin-item-image" src={`${apiBaseUrl}${item.image_url}`} alt={item.name} />
                        ) : null}
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td><span className="category-tag">{item.category || "Main Meals"}</span></td>
                    <td>Rs.{item.price}</td>
                    <td>
                      <span className={`status-pill ${item.is_available ? "status-live" : "status-hidden"}`}>
                        {item.is_available ? "Shown" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <button className="table-action" onClick={() => startEdit(item)}>Edit</button>
                      <button className="table-action" onClick={() => toggleAvailability(item)}>
                        {item.is_available ? "Hide" : "Show"}
                      </button>
                      <button className="table-action danger" onClick={() => removeItem(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="table-empty">No menu items yet. Add your first dish below.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}