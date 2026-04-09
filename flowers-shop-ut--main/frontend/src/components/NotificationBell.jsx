import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Optional: Polling every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const markAsRead = async (id, currentStatus) => {
    if (currentStatus) return; // already read
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // markAllAsRead(); // Optionally auto-read when opening
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch(type) {
      case 'order': return '📦';
      case 'offer': return '🎉';
      case 'success': return '✅';
      case 'alert': return '⚠️';
      default: return '💬';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button className="notification-btn" onClick={toggleDropdown}>
        🔔
        {unreadCount > 0 && <span className="notification-badge animate-pulse">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={markAllAsRead}>Mark all read</button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => markAsRead(n._id, n.isRead)}
                >
                  <div className="notification-icon">{getIcon(n.type)}</div>
                  <div className="notification-content">
                    <h4 className="notification-title">{n.title}</h4>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">{formatDate(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <div className="notification-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
