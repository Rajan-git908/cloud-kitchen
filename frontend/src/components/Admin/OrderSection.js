
//component/Admin/OrderSection.js
// it should only handle order management
import React, {useState} from "react";
import { motion , AnimatePresence} from "framer-motion";
import OrderItem from "../OrderItem";

export default function OrdersSection({ orders, updateStatus, getStatusColor }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  return (
    <motion.div
      className="card p-3 mb-4"
      id="orders"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4>
        Order Tracking <span className="section-count">{orders.length}</span>
      </h4>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Phone Number</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
       
<tbody>
            {orders.length ? (
              orders.map((order) => {
                const itemCount = order.items?.length || order.item_count || 0;
                return (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedOrder(order)}
                        disabled={!order.items || order.items.length === 0}
                      >
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </button>
                    </td>
                    <td>{order.user_phone}</td>
                    <td>{order.user_name}</td>
                    <td>Rs.{Number(order.total)+150}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <select 
                        className={`table-select ${getStatusColor(order.status)}`}
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Preparing">👨‍🍳 Preparing</option>
                        <option value="Out for Delivery">🚚 Out for Delivery</option>
                        <option value="Completed">✅ Completed</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="7" className="table-empty">No customer orders yet.</td></tr>
            )}
          </tbody>

        </table>
      </div>
{/* Item Details Modal */}
      <OrderItem 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </motion.div>
  );
}