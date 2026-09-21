import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaUtensils,
  FaSearch,
  FaPlus,
  FaBookmark,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaChartPie,
  FaCompass,
  FaHistory,
} from 'react-icons/fa';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCount();
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {}
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowSuggestions(true);

    if (val.trim().length >= 2) {
      try {
        const res = await api.get(`/recipes/search/suggestions?q=${encodeURIComponent(val.trim())}`);
        if (res.data.success) {
          setSuggestions(res.data.suggestions || []);
          setRecentSearches(res.data.recent || []);
        }
      } catch (e) {}
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (title) => {
    setSearchTerm(title);
    navigate(`/explore?search=${encodeURIComponent(title)}`);
    setShowSuggestions(false);
  };

  const getProfileImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  return (
    <header style={styles.header}>
      <div style={styles.navContainer}>
        {/* Brand Logo */}
        <Link to="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <FaUtensils style={{ fontSize: '1.25rem' }} />
          </div>
          <span style={styles.logoText}>RecipeSocial</span>
        </Link>

        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={searchRef} style={styles.searchWrapper}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search recipes, ingredients, chefs..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              style={styles.searchInput}
            />
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <div style={styles.suggestionsBox}>
              {suggestions.length > 0 && (
                <div>
                  <div style={styles.suggestionGroupTitle}>Recipe Suggestions</div>
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.title)}
                      style={styles.suggestionItem}
                    >
                      <FaUtensils style={{ color: 'var(--primary)', fontSize: '0.8rem' }} />
                      <span>{item.title}</span>
                      <span className="badge badge-category" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                  <div style={styles.suggestionGroupTitle}>Recent Searches</div>
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSuggestion(term)}
                      style={styles.suggestionItem}
                    >
                      <FaHistory style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }} />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav style={styles.navLinks}>
          <Link
            to="/explore"
            style={{
              ...styles.navItem,
              color: location.pathname === '/explore' ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            <FaCompass /> <span className="nav-text">Explore</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/bookmarks"
                style={{
                  ...styles.navItem,
                  color: location.pathname === '/bookmarks' ? 'var(--primary)' : 'var(--text-main)',
                }}
              >
                <FaBookmark /> <span className="nav-text">Saved</span>
              </Link>

              <Link
                to="/notifications"
                style={{
                  ...styles.navItem,
                  position: 'relative',
                  color: location.pathname === '/notifications' ? 'var(--primary)' : 'var(--text-main)',
                }}
              >
                <FaBell />
                <span className="nav-text">Notifications</span>
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </Link>

              <Link
                to="/dashboard"
                style={{
                  ...styles.navItem,
                  color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-main)',
                }}
              >
                <FaChartPie /> <span className="nav-text">Dashboard</span>
              </Link>

              <Link to="/create-recipe" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <FaPlus /> Create
                </button>
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <div
                  style={styles.userAvatarContainer}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title={user?.name}
                >
                  <img
                    src={getProfileImage(user?.profile_image)}
                    alt={user?.name}
                    style={styles.avatarImg}
                  />
                </div>

                {dropdownOpen && (
                  <div style={styles.dropdownMenu} onClick={() => setDropdownOpen(false)}>
                    <Link to={`/profile/${user?.id}`} style={styles.dropdownItem}>
                      <FaUser /> Profile
                    </Link>
                    <button
                      onClick={logout}
                      style={{ ...styles.dropdownItem, color: '#e63946', border: 'none', background: 'none', width: '100%' }}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/login">
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Log In
                </button>
              </Link>
              <Link to="/register">
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Sign Up
                </button>
              </Link>
            </div>
          )}

          <button onClick={toggleTheme} className="btn-icon" style={styles.themeToggleBtn} title="Toggle Dark/Light Mode">
            {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#f2cc8f' }} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-nav)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontWeight: '800',
    fontSize: '1.35rem',
    color: 'var(--text-main)',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  searchWrapper: {
    position: 'relative',
    flex: '1',
    maxWidth: '380px',
    margin: '0 0.5rem',
  },
  searchForm: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.55rem 1rem 0.55rem 2.25rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
  },
  suggestionsBox: {
    position: 'absolute',
    top: '46px',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
    zIndex: 200,
    padding: '0.5rem 0',
  },
  suggestionGroupTitle: {
    padding: '0.35rem 0.85rem',
    fontSize: '0.725rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.55rem 0.85rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: 'var(--text-main)',
    transition: 'var(--transition)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    background: '#e63946',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarContainer: {
    cursor: 'pointer',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid var(--primary)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: '48px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-md)',
    width: '160px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  themeToggleBtn: {
    width: '36px',
    height: '36px',
  },
};

export default Navbar;
