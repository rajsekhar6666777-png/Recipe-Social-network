import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartPie,
  FaUtensils,
  FaHeart,
  FaUsers,
  FaBookmark,
  FaPlus,
  FaBell,
  FaArrowRight,
  FaEye,
  FaStar,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { BarChart, LineChart } from '../components/AnalyticsChart';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/notifications/dashboard'),
        api.get('/notifications/charts'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentActivity(statsRes.data.recentActivity);
      }
      if (chartsRes.data.success) {
        setChartsData(chartsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSenderImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  if (loading) return <Loader text="Loading your chef analytics dashboard..." />;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={styles.topHeader}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaChartPie style={{ color: 'var(--primary)' }} /> Chef Analytics Dashboard
          </h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Track recipe views, likes growth, and social engagement.</p>
        </div>

        <Link to="/create-recipe">
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
            <FaPlus /> Post New Recipe
          </button>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: 'rgba(224, 122, 95, 0.15)', color: 'var(--primary)' }}>
            <FaUtensils />
          </div>
          <div>
            <h3 style={styles.statVal}>{stats?.totalRecipes || 0}</h3>
            <span style={styles.statLabel}>Recipes Published</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: 'rgba(230, 57, 70, 0.15)', color: '#e63946' }}>
            <FaHeart />
          </div>
          <div>
            <h3 style={styles.statVal}>{stats?.totalLikes || 0}</h3>
            <span style={styles.statLabel}>Likes Earned</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: 'rgba(129, 178, 154, 0.15)', color: 'var(--secondary)' }}>
            <FaEye />
          </div>
          <div>
            <h3 style={styles.statVal}>{stats?.totalViews || 0}</h3>
            <span style={styles.statLabel}>Total Recipe Views</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.iconBox, background: 'rgba(242, 204, 143, 0.25)', color: '#d06043' }}>
            <FaBookmark />
          </div>
          <div>
            <h3 style={styles.statVal}>{stats?.savedRecipesCount || 0}</h3>
            <span style={styles.statLabel}>Saved Recipes</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      {chartsData && (
        <div style={styles.chartsGrid}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={styles.chartTitle}>Monthly Recipe Publications</h3>
            <BarChart data={chartsData.monthlyActivity} />
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={styles.chartTitle}>Likes & Community Growth</h3>
            <LineChart data={chartsData.monthlyActivity} />
          </div>
        </div>
      )}

      {/* Top Recipes & Top Rated Lists */}
      {chartsData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {/* Top Viewed */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaEye style={{ color: 'var(--secondary)' }} /> Most Viewed Recipes
            </h3>
            {chartsData.topViewed && chartsData.topViewed.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {chartsData.topViewed.map((item) => (
                  <div key={item.id} style={styles.topRow}>
                    <img src={item.image} alt={item.title} style={styles.topImg} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/recipe/${item.id}`} style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </Link>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{item.category}</div>
                    </div>
                    <span className="badge" style={{ background: 'var(--bg-input)' }}>
                      {item.views_count} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No view stats yet.</p>
            )}
          </div>

          {/* Top Rated */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaStar style={{ color: '#ffb703' }} /> Highest Rated Recipes
            </h3>
            {chartsData.topRated && chartsData.topRated.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {chartsData.topRated.map((item) => (
                  <div key={item.id} style={styles.topRow}>
                    <img src={item.image} alt={item.title} style={styles.topImg} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/recipe/${item.id}`} style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </Link>
                    </div>
                    <span className="badge" style={{ background: 'rgba(255, 183, 3, 0.15)', color: '#b58304' }}>
                      ⭐ {item.avg_rating} ({item.rating_count})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No ratings recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity Timeline */}
      <div className="glass-card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaBell style={{ color: 'var(--primary)' }} /> Recent Activity & Social Interactions
          </h3>
          <Link to="/notifications" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <FaArrowRight />
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent activity yet. Publish recipes to earn likes, ratings, and comments!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentActivity.map((act) => (
              <div key={act.id} style={styles.activityRow}>
                <img src={getSenderImage(act.sender_image)} alt="User" style={styles.senderAvatar} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>{act.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  statVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    lineHeight: '1.1',
  },
  statLabel: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0',
  },
  topImg: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
  },
  activityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-input)',
  },
  senderAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
};

export default Dashboard;
