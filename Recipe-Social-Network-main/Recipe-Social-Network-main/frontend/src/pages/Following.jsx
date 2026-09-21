import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import UserCard from '../components/UserCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Following = () => {
  const { userId: paramId } = useParams();
  const { user } = useAuth();
  const targetId = paramId || (user ? user.id : null);

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (targetId) fetchFollowing();
  }, [targetId]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/follow/following/${targetId}`);
      if (response.data.success) {
        setFollowing(response.data.following);
      }
    } catch (err) {
      console.error('Failed to fetch following:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaUsers style={{ color: 'var(--primary)' }} /> Following Network
        </h1>
        <p className="page-subtitle">Chefs and creators being followed by this profile.</p>
      </div>

      {loading ? (
        <Loader text="Loading following users..." />
      ) : following.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Not following any chefs yet.
        </div>
      ) : (
        <div className="user-grid">
          {following.map((u) => (
            <UserCard key={u.id} userItem={u} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;
