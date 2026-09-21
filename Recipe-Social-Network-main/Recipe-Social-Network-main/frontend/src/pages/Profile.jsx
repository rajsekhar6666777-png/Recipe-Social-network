import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUserEdit, FaUtensils, FaUsers, FaUserPlus, FaUserCheck, FaBookmark, FaGlobe, FaInstagram, FaMapMarkerAlt, FaUtensilSpoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RecipeCard from '../components/RecipeCard';
import UserCard from '../components/UserCard';
import Loader from '../components/Loader';
import api from '../services/api';

const Profile = () => {
  const { id: paramUserId } = useParams();
  const { user: currentUser } = useAuth();

  const targetUserId = paramUserId || (currentUser ? currentUser.id : null);

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recipes');

  const [userRecipes, setUserRecipes] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isSelf = currentUser && parseInt(currentUser.id) === parseInt(targetUserId);

  useEffect(() => {
    if (targetUserId) {
      fetchProfileData();
    }
  }, [targetUserId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get(`/auth/profile/${targetUserId}`);
      if (userRes.data.success) {
        setProfileUser(userRes.data.user);
      }

      const recRes = await api.get(`/recipes/user/${targetUserId}`);
      if (recRes.data.success) {
        setUserRecipes(recRes.data.recipes);
      }
    } catch (err) {
      toast.error('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'bookmarks' && userBookmarks.length === 0 && isSelf) {
      try {
        const res = await api.get('/bookmarks');
        if (res.data.success) setUserBookmarks(res.data.recipes);
      } catch (e) {}
    } else if (tab === 'followers' && followers.length === 0) {
      try {
        const res = await api.get(`/follow/followers/${targetUserId}`);
        if (res.data.success) setFollowers(res.data.followers);
      } catch (e) {}
    } else if (tab === 'following' && following.length === 0) {
      try {
        const res = await api.get(`/follow/following/${targetUserId}`);
        if (res.data.success) setFollowing(res.data.following);
      } catch (e) {}
    }
  };

  const handleFollowToggle = async () => {
    try {
      const res = await api.post('/follow', { followingId: targetUserId });
      if (res.data.success) {
        setProfileUser((prev) => ({
          ...prev,
          isFollowing: res.data.isFollowing,
          stats: {
            ...prev.stats,
            followersCount: res.data.followersCount,
          },
        }));
        toast.success(res.data.message);
      }
    } catch (e) {
      toast.error('Failed to toggle follow status.');
    }
  };

  const getProfileImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const getCoverImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  if (loading) return <Loader text="Loading chef profile..." />;
  if (!profileUser) return <div style={{ textAlign: 'center', padding: '3rem' }}>User profile not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Profile Banner */}
      <div style={styles.bannerWrapper}>
        <img src={getCoverImage(profileUser.cover_image)} alt="Cover Banner" style={styles.bannerImg} />
      </div>

      {/* Profile Header Box */}
      <div className="glass-card" style={styles.headerCard}>
        <div style={styles.avatarWrapper}>
          <img src={getProfileImage(profileUser.profile_image)} alt={profileUser.name} style={styles.avatar} />
        </div>

        <div style={styles.userInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={styles.userName}>{profileUser.name}</h2>

            {isSelf ? (
              <Link to="/edit-profile">
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}>
                  <FaUserEdit /> Edit Profile
                </button>
              </Link>
            ) : (
              currentUser && (
                <button
                  onClick={handleFollowToggle}
                  className={`btn ${profileUser.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  {profileUser.isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                  {profileUser.isFollowing ? 'Following' : 'Follow Chef'}
                </button>
              )
            )}
          </div>

          <p style={styles.userBio}>{profileUser.bio || 'Passionate home cook & recipe sharing enthusiast.'}</p>

          {/* Social & Location Meta Badges */}
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {profileUser.country && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaMapMarkerAlt style={{ color: 'var(--primary)' }} /> {profileUser.country}
              </span>
            )}
            {profileUser.fav_cuisine && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaUtensilSpoon style={{ color: 'var(--secondary)' }} /> {profileUser.fav_cuisine} Cuisine
              </span>
            )}
            {profileUser.website && (
              <a href={profileUser.website} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
                <FaGlobe /> Website
              </a>
            )}
            {profileUser.instagram && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaInstagram style={{ color: '#e1306c' }} /> @{profileUser.instagram}
              </span>
            )}
          </div>

          {/* Profile Stats Row */}
          <div style={styles.statsRow}>
            <div style={styles.statItem} onClick={() => handleTabChange('recipes')}>
              <strong>{profileUser.stats?.recipesCount || userRecipes.length}</strong>
              <span>Recipes</span>
            </div>

            <div style={styles.statItem} onClick={() => handleTabChange('followers')}>
              <strong>{profileUser.stats?.followersCount || 0}</strong>
              <span>Followers</span>
            </div>

            <div style={styles.statItem} onClick={() => handleTabChange('following')}>
              <strong>{profileUser.stats?.followingCount || 0}</strong>
              <span>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        <button
          onClick={() => handleTabChange('recipes')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'recipes' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'recipes' ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          <FaUtensils /> Recipes ({userRecipes.length})
        </button>

        {isSelf && (
          <button
            onClick={() => handleTabChange('bookmarks')}
            style={{
              ...styles.tabBtn,
              borderBottom: activeTab === 'bookmarks' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'bookmarks' ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <FaBookmark /> Saved Bookmarks
          </button>
        )}

        <button
          onClick={() => handleTabChange('followers')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'followers' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'followers' ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          <FaUsers /> Followers
        </button>

        <button
          onClick={() => handleTabChange('following')}
          style={{
            ...styles.tabBtn,
            borderBottom: activeTab === 'following' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'following' ? 'var(--primary)' : 'var(--text-muted)',
          }}
        >
          <FaUsers /> Following
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'recipes' && (
          userRecipes.length === 0 ? (
            <div style={styles.emptyState}>No recipes created yet.</div>
          ) : (
            <div className="recipe-grid">
              {userRecipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )
        )}

        {activeTab === 'bookmarks' && (
          userBookmarks.length === 0 ? (
            <div style={styles.emptyState}>No saved bookmarks yet.</div>
          ) : (
            <div className="recipe-grid">
              {userBookmarks.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )
        )}

        {activeTab === 'followers' && (
          followers.length === 0 ? (
            <div style={styles.emptyState}>No followers yet.</div>
          ) : (
            <div className="user-grid">
              {followers.map((u) => (
                <UserCard key={u.id} userItem={u} />
              ))}
            </div>
          )
        )}

        {activeTab === 'following' && (
          following.length === 0 ? (
            <div style={styles.emptyState}>Not following any users yet.</div>
          ) : (
            <div className="user-grid">
              {following.map((u) => (
                <UserCard key={u.id} userItem={u} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  bannerWrapper: {
    width: '100%',
    height: '220px',
    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
    overflow: 'hidden',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  headerCard: {
    padding: '2rem',
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    marginTop: '-40px',
  },
  avatarWrapper: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid var(--bg-card)',
    boxShadow: 'var(--shadow-md)',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userName: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '2rem',
    fontWeight: '700',
  },
  userBio: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    maxWidth: '600px',
  },
  statsRow: {
    display: 'flex',
    gap: '2rem',
    marginTop: '0.5rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  tabBar: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '1.75rem',
    overflowX: 'auto',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 1rem',
    fontWeight: '700',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
  },
};

export default Profile;
