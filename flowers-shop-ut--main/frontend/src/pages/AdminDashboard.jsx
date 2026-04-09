import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [allSellers, setAllSellers] = useState([]);
  const [queryModal, setQueryModal] = useState(null); // { seller }
  const [queryText, setQueryText] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, ordersRes, pendingRes, sellersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/orders'),
        api.get('/admin/pending-sellers'),
        api.get('/admin/all-sellers'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);
      setPendingSellers(pendingRes.data);
      setAllSellers(sellersRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApproveSeller = async (id) => {
    try {
      await api.post(`/admin/approve-seller/${id}`);
      toast.success('Seller approved!');
      fetchAll();
    } catch { toast.error('Approval failed'); }
  };

  const handleRejectSeller = async (id) => {
    try {
      await api.post(`/admin/reject-seller/${id}`);
      toast.success('Seller approval revoked');
      fetchAll();
    } catch { toast.error('Revoke failed'); }
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm('Delete this seller account permanently?')) return;
    try {
      await api.delete(`/admin/sellers/${id}`);
      toast.success('Seller deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchAll();
    } catch { toast.error('Status update failed'); }
  };

  const openQueryModal = (seller) => {
    setQueryModal(seller);
    setQueryText('');
  };

  const handleSendQuery = async () => {
    if (!queryText.trim()) return;
    setSendingQuery(true);
    try {
      await api.post(`/admin/sellers/${queryModal._id}/query`, { message: queryText });
      toast.success('Query sent to seller!');
      setQueryModal(null);
      setQueryText('');
    } catch { toast.error('Failed to send query'); }
    finally { setSendingQuery(false); }
  };

  const statusColor = (status) => {
    if (status === 'Delivered') return '#10B981';
    if (status === 'Cancelled') return '#EF4444';
    if (status === 'Shipped') return '#3B82F6';
    if (status === 'Processing') return '#F59E0B';
    return '#6B7280';
  };

  if (loading) return (
    <div className="adm-loading">
      <div className="adm-spinner"></div>
      <p>Loading Admin Dashboard...</p>
    </div>
  );

  return (
    <div className="adm-page">
      {/* === HEADER === */}
      <div className="adm-header">
        <div className="adm-header-inner">
          <div>
            <h1 className="adm-title">🌸 Admin Control Panel</h1>
            <p className="adm-subtitle">Manage your flower shop platform from one place</p>
          </div>
          <button className="adm-refresh-btn" onClick={fetchAll} title="Refresh data">↻ Refresh</button>
        </div>
      </div>

      {/* === STAT CARDS === */}
      <div className="adm-stats-grid">
        <div className="adm-stat-card adm-stat-rose">
          <div className="adm-stat-icon">👥</div>
          <div className="adm-stat-num">{stats.totalUsers}</div>
          <div className="adm-stat-label">Total Users</div>
        </div>
        <div className="adm-stat-card adm-stat-green">
          <div className="adm-stat-icon">🌼</div>
          <div className="adm-stat-num">{stats.totalProducts}</div>
          <div className="adm-stat-label">Total Products</div>
        </div>
        <div className="adm-stat-card adm-stat-blue">
          <div className="adm-stat-icon">📦</div>
          <div className="adm-stat-num">{stats.totalOrders}</div>
          <div className="adm-stat-label">Total Orders</div>
        </div>
        <div className="adm-stat-card adm-stat-purple">
          <div className="adm-stat-icon">💰</div>
          <div className="adm-stat-num">₹{stats.totalRevenue?.toLocaleString()}</div>
          <div className="adm-stat-label">Total Revenue</div>
        </div>
        <div className="adm-stat-card adm-stat-amber">
          <div className="adm-stat-icon">⏳</div>
          <div className="adm-stat-num">{pendingSellers.length}</div>
          <div className="adm-stat-label">Pending Sellers</div>
        </div>
      </div>

      {/* === TABS === */}
      <div className="adm-tabs">
        {[
          { key: 'overview', label: '🏠 Overview' },
          { key: 'pending', label: `⏳ Pending (${pendingSellers.length})` },
          { key: 'sellers', label: '🏪 All Sellers' },
          { key: 'users', label: '👥 Users' },
          { key: 'orders', label: '📦 Orders' },
        ].map(t => (
          <button
            key={t.key}
            className={`adm-tab-btn${activeTab === t.key ? ' active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="adm-content">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="adm-overview-grid">
            {/* Recent Orders */}
            <div className="adm-card">
              <h2 className="adm-card-title">Recent Orders</h2>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o._id}>
                        <td className="adm-mono">#{o._id.slice(-6)}</td>
                        <td>{o.user?.name || o.shippingAddress?.fullName || '—'}</td>
                        <td className="adm-bold-pink">₹{o.totalPrice}</td>
                        <td><span className="adm-badge" style={{ background: statusColor(o.status) + '22', color: statusColor(o.status) }}>{o.status}</span></td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan="4" className="adm-empty-cell">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending sellers quick view */}
            <div className="adm-card">
              <h2 className="adm-card-title">Pending Seller Applications</h2>
              {pendingSellers.length === 0 ? (
                <div className="adm-empty">✅ No pending applications</div>
              ) : (
                <div className="adm-pending-list">
                  {pendingSellers.slice(0, 4).map(s => (
                    <div key={s._id} className="adm-pending-item">
                      <div>
                        <div className="adm-seller-name">{s.businessName || s.name}</div>
                        <div className="adm-seller-email">{s.email}</div>
                      </div>
                      <div className="adm-action-btns">
                        <button className="adm-btn adm-btn-green" onClick={() => handleApproveSeller(s._id)}>Approve</button>
                        <button className="adm-btn adm-btn-red" onClick={() => handleRejectSeller(s._id)}>Reject</button>
                      </div>
                    </div>
                  ))}
                  {pendingSellers.length > 4 && (
                    <button className="adm-view-all" onClick={() => setActiveTab('pending')}>View all {pendingSellers.length} →</button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PENDING SELLERS ── */}
        {activeTab === 'pending' && (
          <div className="adm-card">
            <h2 className="adm-card-title">⏳ Pending Seller Applications</h2>
            {pendingSellers.length === 0 ? (
              <div className="adm-empty">✅ No pending seller applications right now.</div>
            ) : (
              <div className="adm-seller-cards">
                {pendingSellers.map(s => (
                  <div key={s._id} className="adm-seller-card">
                    <div className="adm-seller-avatar">{(s.businessName || s.name || '?')[0].toUpperCase()}</div>
                    <div className="adm-seller-body">
                      <h3>{s.businessName || s.name}</h3>
                      <p className="adm-seller-email">📧 {s.email}</p>
                      {s.businessAddress && <p className="adm-seller-addr">📍 {s.businessAddress}</p>}
                      <p className="adm-seller-date">Applied: {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="adm-seller-actions">
                      <button className="adm-btn adm-btn-green" onClick={() => handleApproveSeller(s._id)}>✓ Approve</button>
                      <button className="adm-btn adm-btn-red" onClick={() => handleRejectSeller(s._id)}>✗ Reject</button>
                      <button className="adm-btn adm-btn-outline" onClick={() => openQueryModal(s)}>💬 Message</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL SELLERS ── */}
        {activeTab === 'sellers' && (
          <div className="adm-card">
            <h2 className="adm-card-title">🏪 All Sellers & Revenue</h2>
            {allSellers.length === 0 ? (
              <div className="adm-empty">No sellers registered yet.</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Seller</th>
                      <th>Email</th>
                      <th>Business</th>
                      <th>Status</th>
                      <th>Revenue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSellers.map(s => (
                      <tr key={s._id}>
                        <td className="adm-td-name">{s.name}</td>
                        <td className="adm-td-muted">{s.email}</td>
                        <td>{s.businessName || '—'}</td>
                        <td>
                          <span className="adm-badge" style={{
                            background: s.isApproved ? '#10B98122' : '#F59E0B22',
                            color: s.isApproved ? '#10B981' : '#F59E0B'
                          }}>
                            {s.isApproved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="adm-bold-pink">₹{s.revenue?.toLocaleString() || 0}</td>
                        <td>
                          <div className="adm-action-btns">
                            {s.isApproved
                              ? <button className="adm-btn adm-btn-red adm-btn-sm" onClick={() => handleRejectSeller(s._id)}>Revoke</button>
                              : <button className="adm-btn adm-btn-green adm-btn-sm" onClick={() => handleApproveSeller(s._id)}>Approve</button>
                            }
                            <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => openQueryModal(s)}>💬</button>
                            <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => handleDeleteSeller(s._id)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className="adm-card">
            <h2 className="adm-card-title">👥 Registered Users</h2>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id}>
                      <td className="adm-td-muted">{i + 1}</td>
                      <td className="adm-td-name">{u.name}</td>
                      <td className="adm-td-muted">{u.email}</td>
                      <td>
                        <span className="adm-badge" style={{
                          background: u.role === 'seller' ? '#8B5CF622' : '#6B728022',
                          color: u.role === 'seller' ? '#8B5CF6' : '#6B7280'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="adm-td-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => handleDeleteUser(u._id)}>🗑 Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="6" className="adm-empty-cell">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <div className="adm-card">
            <h2 className="adm-card-title">📦 All Orders</h2>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td className="adm-mono">#{o._id.slice(-8)}</td>
                      <td>{o.user?.name || o.shippingAddress?.fullName || '—'}</td>
                      <td className="adm-td-muted">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="adm-td-muted">{o.orderItems?.length || 0} item(s)</td>
                      <td className="adm-bold-pink">₹{o.totalPrice}</td>
                      <td>
                        <span className="adm-badge" style={{ background: statusColor(o.status) + '22', color: statusColor(o.status) }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="adm-select"
                          value={o.status}
                          onChange={(e) => handleOrderStatus(o._id, e.target.value)}
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
                  {orders.length === 0 && <tr><td colSpan="7" className="adm-empty-cell">No orders placed yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── QUERY MODAL ── */}
      {queryModal && (
        <div className="adm-modal-overlay" onClick={() => setQueryModal(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>💬 Send Message to Seller</h3>
              <button className="adm-modal-close" onClick={() => setQueryModal(null)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p className="adm-modal-to">To: <strong>{queryModal.businessName || queryModal.name}</strong> ({queryModal.email})</p>
              <textarea
                className="adm-textarea"
                rows={5}
                placeholder="Type your message, query resolution, or instructions for the seller..."
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
              />
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-outline" onClick={() => setQueryModal(null)}>Cancel</button>
              <button className="adm-btn adm-btn-green" onClick={handleSendQuery} disabled={sendingQuery || !queryText.trim()}>
                {sendingQuery ? 'Sending...' : '📨 Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
