import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Shop.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading your orders...</p></div>;

  return (
    <div className="shop-page">
      <div className="shop-container">
        <h1 className="shop-header">My Orders</h1>
        
        {location.state?.message && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
            {location.state.message}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <p>Order ID: <span>{order._id}</span></p>
                    <p>Placed on: <span>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                  </div>
                  <div className="order-meta">
                    <p className="order-total">Total: ₹{order.totalPrice}</p>
                    <span className={`status-badge ${order.status?.toLowerCase() || 'default'}`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
                
                <div className="order-body">
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Shipping To:</h4>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                    {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.phone}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem', fontWeight: 500 }}>
                    Payment Method: <span style={{color: '#db2777'}}>{order.paymentMethod || 'COD'}</span>
                  </p>
                  <ul className="item-list">
                    {order.orderItems.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', padding: '0.75rem 0', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Qty: {item.qty}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>₹{item.price}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
