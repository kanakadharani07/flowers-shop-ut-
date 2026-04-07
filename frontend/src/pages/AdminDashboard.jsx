import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const fetchAdminOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchAdminOrders(); // Refresh list
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="empty-state-text py-20">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-header">Admin Dashboard</h1>
        
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">All System Orders</h2>
          </div>
          
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="td-text-dark">{order._id.substring(0, 8)}...</td>
                    <td className="td-text">{order.shippingAddress?.fullName || 'Unknown'}</td>
                    <td className="td-text">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="td-bold-pink">₹{order.totalPrice}</td>
                    <td>
                      <span className={`status-badge 
                        ${order.status === 'Pending' ? 'pending' : 
                          order.status === 'Delivered' ? 'delivered' : 
                          order.status === 'Cancelled' ? 'cancelled' : 'default'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="table-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="empty-state-text">No orders found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
