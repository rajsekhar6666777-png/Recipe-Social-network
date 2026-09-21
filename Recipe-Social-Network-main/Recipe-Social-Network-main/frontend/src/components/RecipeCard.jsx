import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaComment, FaClock, FaEye, FaShareAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import api from '../services/api';

const RecipeCard = ({ recipe, onLikeToggle, onBookmarkToggle }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(recipe.is_liked || false);
  const [likesCount, setLikesCount] = useState(recipe.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(recipe.is_bookmarked || false);

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const getAuthorImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to like recipes!');
      return navigate('/login');
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const response = await api.post('/likes', { recipeId: recipe.id });
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
        if (onLikeToggle) onLikeToggle(recipe.id, response.data.isLiked);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to update like status.');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to save recipes!');
      return navigate('/login');
    }

    const prevBookmark = isBookmarked;
    setIsBookmarked(!prevBookmark);

    try {
      const response = await api.post('/bookmarks', { recipeId: recipe.id });
      if (response.data.success) {
        setIsBookmarked(response.data.isBookmarked);
        toast.success(response.data.message);
        if (onBookmarkToggle) onBookmarkToggle(recipe.id, response.data.isBookmarked);
      }
    } catch (err) {
      setIsBookmarked(prevBookmark);
      toast.error('Failed to bookmark recipe.');
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`;
    if (navigator.share) {
      navigator.share({ title: recipe.title, url: recipeUrl });
    } else {
      navigator.clipboard.writeText(recipeUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="glass-card recipe-card-hover" style={styles.card}>
      {/* Image Container with Badges & Hover Zoom */}
      <div style={styles.imageContainer}>
        <Link to={`/recipe/${recipe.id}`}>
          <img
            src={getImageUrl(recipe.image)}
            alt={recipe.title}
            className="recipe-card-img"
            style={styles.image}
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div style={styles.badgeGroup}>
          <span className="badge badge-category">{recipe.category}</span>
          <span className={`badge badge-${(recipe.difficulty || 'Easy').toLowerCase()}`}>
            {recipe.difficulty || 'Easy'}
          </span>
        </div>

        {/* Bookmark & Share Action Buttons Overlay */}
        <div style={styles.topRightActions}>
          <button
            onClick={handleBookmark}
            style={{
              ...styles.overlayBtn,
              color: isBookmarked ? '#e07a5f' : '#ffffff',
            }}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Recipe'}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <button onClick={handleShare} style={styles.overlayBtn} title="Share Recipe">
            <FaShareAlt style={{ color: '#fff', fontSize: '0.85rem' }} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={styles.content}>
        {/* Author & Star Rating Header */}
        <div style={styles.authorRow}>
          <Link to={`/profile/${recipe.user_id}`} style={styles.authorLink}>
            <img
              src={getAuthorImage(recipe.author_image)}
              alt={recipe.author_name}
              style={styles.authorAvatar}
            />
            <span style={styles.authorName}>{recipe.author_name || 'Chef'}</span>
          </Link>

          <StarRating value={parseFloat(recipe.avg_rating || 0)} readonly showCount={true} totalCount={recipe.rating_count} size="0.85rem" />
        </div>

        {/* Recipe Title */}
        <Link to={`/recipe/${recipe.id}`} style={styles.titleLink}>
          <h3 style={styles.title}>{recipe.title}</h3>
        </Link>

        {/* Description Snippet */}
        <p style={styles.description}>
          {recipe.description && recipe.description.length > 85
            ? `${recipe.description.substring(0, 85)}...`
            : recipe.description}
        </p>

        {/* Meta Stats Row (Time, Servings, Views) */}
        <div style={styles.metaRow}>
          <div style={styles.metaItem}>
            <FaClock style={{ color: 'var(--primary)' }} />
            <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}m</span>
          </div>
          <div style={styles.metaItem}>
            <FaEye style={{ color: 'var(--secondary)' }} />
            <span>{recipe.views_count || 0} Views</span>
          </div>
        </div>

        {/* Footer Actions Row */}
        <div style={styles.footerRow}>
          <button onClick={handleLike} style={styles.actionBtn}>
            {isLiked ? (
              <FaHeart style={{ color: '#e63946', fontSize: '1.05rem' }} />
            ) : (
              <FaRegHeart style={{ fontSize: '1.05rem' }} />
            )}
            <span style={{ fontWeight: '600', color: isLiked ? '#e63946' : 'var(--text-main)' }}>
              {likesCount}
            </span>
          </button>

          <Link to={`/recipe/${recipe.id}#comments`} style={styles.actionBtn}>
            <FaComment style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }} />
            <span style={{ fontWeight: '600' }}>{recipe.comments_count || 0}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '210px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-input)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  badgeGroup: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    gap: '6px',
    zIndex: 2,
  },
  topRightActions: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex',
    gap: '6px',
    zIndex: 2,
  },
  overlayBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  content: {
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
  },
  authorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  authorLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  authorAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  authorName: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  titleLink: {
    textDecoration: 'none',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.35',
    marginBottom: '0.4rem',
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.45',
    marginBottom: '0.85rem',
    flex: '1',
  },
  metaRow: {
    display: 'flex',
    gap: '1.25rem',
    fontSize: '0.775rem',
    color: 'var(--text-muted)',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '0.75rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontWeight: '500',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
};

// Inject Hover CSS
if (typeof document !== 'undefined' && !document.getElementById('recipe-card-hover-css')) {
  const style = document.createElement('style');
  style.id = 'recipe-card-hover-css';
  style.innerText = `
    .recipe-card-hover:hover .recipe-card-img {
      transform: scale(1.06);
    }
  `;
  document.head.appendChild(style);
}

export default RecipeCard;
