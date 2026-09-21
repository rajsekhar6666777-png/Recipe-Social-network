import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import UserCard from '../components/UserCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Followers = () => {
  const { userId: paramId } = useParams();
  const { user } = useAuth();
  const targetId = paramId || (user ? user.id : null);

  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (targetId) fetchFollowers();
  }, [targetId]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/follow/followers/${targetId}`);
      if (response.data.success) {
        setFollowers(response.data.followers);
      }
    } catch (err) {
      console.error('Failed to fetch followers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaUsers style={{ color: 'var(--primary)' }} /> Followers Network
        </h1>
        <p className="page-subtitle">Chefs and food enthusiasts following this profile.</p>
      </div>

      {loading ? (
        <Loader text="Loading followers..." />
      ) : followers.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No followers yet.
        </div>
      ) : (
        <div className="user-grid">
          {followers.map((u) => (
            <UserCard key={u.id} userItem={u} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Followers;
