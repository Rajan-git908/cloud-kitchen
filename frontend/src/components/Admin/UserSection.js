
//component/Admin/UserSection.js
// it should only handle user management
import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function UsersSection() {
  const { token, apiBaseUrl } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBaseUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle both response formats: direct array or object with users property
        setUsers(Array.isArray(res.data) ? res.data : (res.data.users || []));
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.response?.data?.error || "Failed to load user list");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token, apiBaseUrl]);

  return (
    <motion.div 
      className="card p-3 mb-4" 
      id="users"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4>
        User Management <span className="section-count">{users.length}</span>
      </h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p className="studio-loading">Loading users...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.id}</strong></td>
                    <td>{user.name || user.full_name || "N/A"}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>
                      <span className={`status-pill ${user.role === 'admin' ? 'status-live' : 'status-hidden'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No registered users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}