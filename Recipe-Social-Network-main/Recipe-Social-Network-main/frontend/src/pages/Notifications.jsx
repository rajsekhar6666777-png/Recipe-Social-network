import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await api.put('/notifications/read', {});
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        toast.success('All notifications marked as read.');
      }
    } catch (err) {
      toast.error('Failed to update notifications.');
    }
  };

  const getSenderImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaBell style={{ color: 'var(--primary)' }} /> Notifications Center
          </h1>
          <p className="page-subtitle">Stay updated on likes, comments, and new followers.</p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <FaCheckDouble /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <Loader text="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No notifications yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="glass-card"
              style={{
                padding: '1.15rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderLeft: n.is_read ? '1px solid var(--border-color)' : '4px solid var(--primary)',
                background: n.is_read ? 'var(--bg-card)' : 'var(--primary-light)',
              }}
            >
              <img src={getSenderImage(n.sender_image)} alt="User" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: n.is_read ? '500' : '700', fontSize: '0.95rem' }}>{n.message}</p>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
