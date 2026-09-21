import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const UserCard = ({ userItem, onFollowToggle }) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(userItem.isFollowing || false);
  const [loading, setLoading] = useState(false);

  const getProfileImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to follow users!');
      return navigate('/login');
    }

    setLoading(true);
    try {
      const response = await api.post('/follow', { followingId: userItem.id });
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        toast.success(response.data.message);
        if (onFollowToggle) onFollowToggle(userItem.id, response.data.isFollowing);
      }
    } catch (err) {
      toast.error('Failed to update follow status.');
    } finally {
      setLoading(false);
    }
  };

  const isSelf = currentUser && currentUser.id === userItem.id;

  return (
    <div className="glass-card" style={styles.card}>
      <div style={styles.avatarWrapper}>
        <img
          src={getProfileImage(userItem.profile_image)}
          alt={userItem.name}
          style={styles.avatar}
        />
      </div>

      <h4 style={styles.name}>{userItem.name}</h4>
      <p style={styles.bio}>
        {userItem.bio ? (userItem.bio.length > 70 ? `${userItem.bio.substring(0, 70)}...` : userItem.bio) : 'Chef & recipe lover'}
      </p>

      <div style={styles.meta}>
        <FaUtensils style={{ color: 'var(--primary)', fontSize: '0.8rem' }} />
        <span>{userItem.recipes_count || 0} Recipes</span>
      </div>

      <div style={styles.actions}>
        <Link to={`/profile/${userItem.id}`} style={{ textDecoration: 'none', flex: 1 }}>
          <button className="btn btn-outline" style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.825rem' }}>
            View Profile
          </button>
        </Link>

        {!isSelf && (
          <button
            onClick={handleFollow}
            disabled={loading}
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
          >
            {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  avatarWrapper: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid var(--primary)',
    marginBottom: '0.85rem',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.25rem',
  },
  bio: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: '0.85rem',
    minHeight: '2.5em',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '1.2rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    width: '100%',
  },
};

export default UserCard;
