import React, { useState } from "react";
import { motion } from "framer-motion";

export default function MenuSection({
  menuItems = [],
  apiBaseUrl = "",
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
  menuCategories = []
}) {
  const [imageError, setImageError] = useState("");
  const [fileName, setFileName] = useState("");

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit

  const handleImageChange = (e) => {
    setImageError("");
    const file = e.target.files[0];

    if (!file) {
      setImage(null);
      setFileName("");
      return;
    }

    try {
      // Validate File Type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      }

      // Validate File Size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 5MB. Please upload a smaller image.");
      }

      setImage(file);
      setFileName(file.name);
    } catch (err) {
      // Reset input value on exception
      e.target.value = "";
      setImage(null);
      setFileName("");
      setImageError(err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      // Reset file-specific state on successful submission
      setFileName("");
      setImageError("");
    } catch (error) {
      setImageError(error.message || "Failed to submit form. Please try again.");
    }
  };

  // Safe fallback renderer for absolute vs relative image URLs
  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http://") || path.startsWith("https://") 
      ? path 
      : `${apiBaseUrl}${path}`;
  };

  return (
    <div id="menu">
      {/* Form for Add/Edit Item */}
      <motion.form 
        onSubmit={handleFormSubmit} 
        className="card p-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h4>{editingId ? "Edit Menu Item" : "Add New Menu Item"}</h4>
        
        <input 
          className="form-control mb-2" 
          type="text" 
          placeholder="Item name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          className="form-control mb-2" 
          type="number" 
          placeholder="Price" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          required 
        />
        <textarea 
          className="form-control mb-2" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <select 
          className="form-select mb-2" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          aria-label="Food category"
        >
          {menuCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* File Input with Validation & File Name Feedback */}
        <div className="mb-2">
          <input 
            className={`form-control ${imageError ? "is-invalid" : ""}`} 
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={handleImageChange} 
          />
          {fileName && !imageError && (
            <small className="text-muted mt-1 d-block">
              Selected file: <strong>{fileName}</strong>
            </small>
          )}
          {imageError && <div className="invalid-feedback d-block">{imageError}</div>}
        </div>

        <motion.button 
          className="btn btn-primary" 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {editingId ? "Save Changes" : "Add Menu Item"}
        </motion.button>
      </motion.form>

      {/* Menu Management List */}
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
                          <img 
                            className="admin-item-image" 
                            src={getImageUrl(item.image_url)} 
                            alt={item.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
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
                <tr>
                  <td colSpan="5" className="table-empty">No menu items yet. Add your first dish below.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}