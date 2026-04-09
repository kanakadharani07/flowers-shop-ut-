import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', image: '', category: 'Bouquets', stock: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const meRes = await api.get('/auth/profile');
      const sellerId = meRes.data._id;

      const prodRes = await api.get('/products');
      const myProducts = user?.role === 'admin' ? prodRes.data : prodRes.data.filter(p => p.sellerId?._id === sellerId || p.sellerId === sellerId);
      setProducts(myProducts);

      const ordRes = await api.get('/seller/orders');
      setOrders(ordRes.data);
    } catch (err) {
      console.error('Error fetching seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        alert('Product added successfully!');
      }
      setFormData({ name: '', description: '', price: '', image: '', category: 'Bouquets', stock: '' });
      setEditingId(null);
      fetchSellerData();
      setActiveTab('products');
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status });
      const ordRes = await api.get('/seller/orders');
      setOrders(ordRes.data);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleEdit = (prod) => {
    setFormData({
      name: prod.name, description: prod.description, price: prod.price, 
      image: prod.image, category: prod.category, stock: prod.stock
    });
    setEditingId(prod._id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchSellerData();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="empty-state-text py-20">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-header">Admin / Store Dashboard</h1>
        
        <div className="tabs-container">
          <div className="tabs-list">
            <div className="tab-item">
               <button onClick={() => setActiveTab('products')} className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}>My Products</button>
            </div>
            <div className="tab-item">
               <button onClick={() => setActiveTab('orders')} className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>Orders</button>
            </div>
            <div className="tab-item">
               <button onClick={() => setActiveTab('add')} className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}>{editingId ? 'Edit Product' : 'Add Product'}</button>
            </div>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="dashboard-card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td><img src={p.image} alt={p.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}/></td>
                      <td className="td-text-dark">{p.name}</td>
                      <td className="td-text">₹{p.price}</td>
                      <td>
                        <span className={`status-badge ${p.stock < 5 ? 'pending' : 'delivered'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(p)} className="action-btn-primary">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="action-btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="empty-state-text">No products found. Start adding some!</div>}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
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
        )}

        {activeTab === 'add' && (
          <div className="dashboard-form-container">
            <form onSubmit={handleSubmit} className="dashboard-form">
              <div className="form-group"><label>Name</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control"/></div>
              <div className="form-group"><label>Description</label><textarea required name="description" value={formData.description} onChange={handleInputChange} className="form-control"></textarea></div>
              <div className="form-row">
                <div className="form-group"><label>Price (₹)</label><input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="form-control"/></div>
                <div className="form-group"><label>Stock</label><input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="form-control"/></div>
              </div>
              <div className="form-group"><label>Image URL</label><input required type="url" name="image" value={formData.image} onChange={handleInputChange} className="form-control"/></div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="form-control">
                  <option value="Bouquets">Bouquets</option>
                  <option value="Arrangements">Arrangements</option>
                  <option value="Pots">Pots</option>
                  <option value="Gifts">Gifts</option>
                  <option value="Specials">Specials</option>
                </select>
              </div>
              <button type="submit" className="btn-submit">{editingId ? 'Update Product' : 'Add Product'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
