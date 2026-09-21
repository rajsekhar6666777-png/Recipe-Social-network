import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaClock,
  FaUtensilSpoon,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaUserPlus,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRegCircle,
  FaShareAlt,
  FaEye,
  FaPrint,
  FaCalendarPlus,
  FaFire,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import CommentSection from '../components/CommentSection';
import RecipeCard from '../components/RecipeCard';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';

const RecipeDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Ratings State
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState('0.0');
  const [ratingCount, setRatingCount] = useState(0);

  // Interactive Checklists
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [checkedSteps, setCheckedSteps] = useState({});

  useEffect(() => {
    fetchRecipeDetails();
    recordView();
    window.scrollTo(0, 0);
  }, [id]);

  const recordView = async () => {
    try {
      await api.post(`/recipes/${id}/view`);
    } catch (e) {}
  };

  const fetchRecipeDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/recipes/${id}`);
      if (response.data.success) {
        const r = response.data.recipe;
        setRecipe(r);
        setIsLiked(r.is_liked);
        setLikesCount(r.likes_count);
        setIsBookmarked(r.is_bookmarked);
        setAvgRating(r.avg_rating);
        setRatingCount(r.rating_count || 0);
        setUserRating(r.user_rating || 0);

        if (user && user.id !== r.user_id) {
          fetchAuthorFollowStatus(r.user_id);
        }
      }
    } catch (err) {
      toast.error('Recipe not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorFollowStatus = async (authorId) => {
    try {
      const res = await api.get(`/auth/profile/${authorId}`);
      if (res.data.success) {
        setIsFollowing(res.data.user.isFollowing || false);
      }
    } catch (e) {}
  };

  const handleRatingSubmit = async (newRating) => {
    if (!isAuthenticated) {
      toast.info('Please log in to rate this recipe!');
      return navigate('/login');
    }

    try {
      const res = await api.post('/ratings', { recipeId: id, rating: newRating });
      if (res.data.success) {
        setUserRating(res.data.userRating);
        setAvgRating(res.data.avgRating);
        setRatingCount(res.data.ratingCount);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to submit rating.');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to like this recipe!');
      return navigate('/login');
    }
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.post('/likes', { recipeId: id });
      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save this recipe!');
      return navigate('/login');
    }
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      const res = await api.post('/bookmarks', { recipeId: id });
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      setIsBookmarked(prev);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to follow chefs!');
      return navigate('/login');
    }
    try {
      const res = await api.post('/follow', { followingId: recipe.user_id });
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update follow status.');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const res = await api.delete(`/recipes/${id}`);
      if (res.data.success) {
        toast.success('Recipe deleted.');
        navigate('/');
      }
    } catch (err) {
      toast.error('Failed to delete recipe.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: recipe?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe URL copied to clipboard!');
    }
  };

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

  if (loading) return <Loader text="Loading culinary details..." />;
  if (!recipe) return <div style={{ textAlign: 'center', padding: '3rem' }}>Recipe not found.</div>;

  const ingredientsList = recipe.ingredients ? recipe.ingredients.split('\n').filter((i) => i.trim()) : [];
  const instructionsList = recipe.instructions ? recipe.instructions.split('\n').filter((i) => i.trim()) : [];
  const isOwner = user && user.id === recipe.user_id;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Info */}
      <div style={styles.header}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-category">{recipe.category}</span>
          <span className={`badge badge-${(recipe.difficulty || 'Easy').toLowerCase()}`}>
            {recipe.difficulty || 'Easy'}
          </span>
          <span className="badge" style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}>
            {recipe.cuisine || 'Global'}
          </span>
        </div>

        <h1 className="page-title">{recipe.title}</h1>
        <p style={styles.description}>{recipe.description}</p>

        {/* Rating & Views summary */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StarRating value={parseFloat(avgRating)} readonly totalCount={ratingCount} size="1.1rem" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <FaEye style={{ color: 'var(--secondary)' }} />
            <span>{recipe.views_count || 0} Views</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <FaFire style={{ color: 'var(--primary)' }} />
            <span>{recipe.calories || 350} kcal</span>
          </div>
        </div>

        {/* Author & Action Bar */}
        <div style={styles.authorBar}>
          <div style={styles.authorGroup}>
            <Link to={`/profile/${recipe.user_id}`}>
              <img
                src={getAuthorImage(recipe.author_image)}
                alt={recipe.author_name}
                style={styles.authorAvatar}
              />
            </Link>
            <div>
              <Link to={`/profile/${recipe.user_id}`} style={styles.authorNameLink}>
                <span style={styles.authorName}>{recipe.author_name}</span>
              </Link>
              <p style={styles.publishDate}>
                {recipe.author_country || 'Global Chef'} • {new Date(recipe.created_at).toLocaleDateString()}
              </p>
            </div>

            {!isOwner && user && (
              <button
                onClick={handleFollow}
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
              >
                {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          <div style={styles.actionButtons}>
            <button onClick={handleLike} className="btn btn-outline" style={{ color: isLiked ? '#e63946' : 'inherit' }}>
              {isLiked ? <FaHeart style={{ color: '#e63946' }} /> : <FaRegHeart />}
              <span>{likesCount} Likes</span>
            </button>

            <button onClick={handleBookmark} className="btn btn-outline" style={{ color: isBookmarked ? '#e07a5f' : 'inherit' }}>
              {isBookmarked ? <FaBookmark style={{ color: '#e07a5f' }} /> : <FaRegBookmark />}
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <button onClick={handlePrint} className="btn btn-outline">
              <FaPrint /> Print
            </button>

            <button onClick={handleShare} className="btn btn-outline">
              <FaShareAlt /> Share
            </button>

            {isOwner && (
              <>
                <Link to={`/edit-recipe/${recipe.id}`}>
                  <button className="btn btn-outline"><FaEdit /> Edit</button>
                </Link>
                <button onClick={handleDeleteRecipe} className="btn btn-outline" style={{ color: '#e63946' }}>
                  <FaTrash /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div style={styles.heroImageWrapper}>
        <img src={getImageUrl(recipe.image)} alt={recipe.title} style={styles.heroImage} />
      </div>

      {/* Star Rating Interactive Feedback Card */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Rate this Recipe</h4>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>How did your dish turn out?</p>
        </div>
        <StarRating value={userRating} onChange={handleRatingSubmit} showCount={false} size="1.4rem" />
      </div>

      {/* Quick Meta Cards */}
      <div style={styles.metaCardsGrid}>
        <div style={styles.metaCard}>
          <FaClock style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
          <div>
            <span style={styles.metaLabel}>Prep Time</span>
            <strong style={styles.metaVal}>{recipe.prep_time} mins</strong>
          </div>
        </div>
        <div style={styles.metaCard}>
          <FaClock style={{ color: 'var(--secondary)', fontSize: '1.4rem' }} />
          <div>
            <span style={styles.metaLabel}>Cook Time</span>
            <strong style={styles.metaVal}>{recipe.cook_time} mins</strong>
          </div>
        </div>
        <div style={styles.metaCard}>
          <FaUtensilSpoon style={{ color: 'var(--accent-dark)', fontSize: '1.4rem' }} />
          <div>
            <span style={styles.metaLabel}>Servings</span>
            <strong style={styles.metaVal}>{recipe.servings} people</strong>
          </div>
        </div>
      </div>

      {/* Recipe Content Body: Ingredients & Instructions */}
      <div style={styles.contentBody}>
        {/* Ingredients Column */}
        <div style={styles.ingredientsBox} className="glass-card">
          <h3 style={styles.sectionHeader}>Ingredients Needed</h3>
          <p style={styles.checklistHint}>Click item to check off while cooking:</p>

          <ul style={styles.ingredientsList}>
            {ingredientsList.map((ing, idx) => {
              const isChecked = checkedIngredients[idx];
              return (
                <li
                  key={idx}
                  onClick={() => setCheckedIngredients({ ...checkedIngredients, [idx]: !isChecked })}
                  style={{
                    ...styles.ingredientItem,
                    textDecoration: isChecked ? 'line-through' : 'none',
                    opacity: isChecked ? 0.6 : 1,
                  }}
                >
                  {isChecked ? (
                    <FaCheckCircle style={{ color: 'var(--secondary)' }} />
                  ) : (
                    <FaRegCircle style={{ color: 'var(--text-light)' }} />
                  )}
                  <span>{ing}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Instructions Column */}
        <div style={styles.instructionsBox} className="glass-card">
          <h3 style={styles.sectionHeader}>Step-by-Step Instructions</h3>

          <div style={styles.instructionsList}>
            {instructionsList.map((step, idx) => {
              const isChecked = checkedSteps[idx];
              return (
                <div
                  key={idx}
                  onClick={() => setCheckedSteps({ ...checkedSteps, [idx]: !isChecked })}
                  style={{
                    ...styles.instructionStep,
                    opacity: isChecked ? 0.6 : 1,
                  }}
                >
                  <div style={styles.stepNumBadge}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      lineHeight: '1.6',
                      fontSize: '1rem',
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}>
                      {step}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments Module */}
      <CommentSection recipeId={recipe.id} />

      {/* Related Recipes Section */}
      {recipe.related && recipe.related.length > 0 && (
        <section style={{ marginTop: '3.5rem' }}>
          <h3 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.25rem' }}>
            More Recipes in {recipe.category}
          </h3>
          <div className="recipe-grid">
            {recipe.related.map((rel) => (
              <RecipeCard key={rel.id} recipe={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '1.75rem',
  },
  description: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '1.25rem',
  },
  authorBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  authorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  authorAvatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  authorNameLink: {
    textDecoration: 'none',
  },
  authorName: {
    fontWeight: '700',
    fontSize: '1.05rem',
    color: 'var(--text-main)',
  },
  publishDate: {
    fontSize: '0.775rem',
    color: 'var(--text-muted)',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  heroImageWrapper: {
    width: '100%',
    height: '420px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    marginBottom: '1.75rem',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  metaCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  metaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  },
  metaLabel: {
    display: 'block',
    fontSize: '0.775rem',
    color: 'var(--text-muted)',
  },
  metaVal: {
    fontSize: '1rem',
    color: 'var(--text-main)',
  },
  contentBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '1.75rem',
  },
  ingredientsBox: {
    padding: '1.5rem',
    height: 'fit-content',
  },
  sectionHeader: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  checklistHint: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '1.25rem',
  },
  ingredientsList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  ingredientItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  instructionsBox: {
    padding: '1.5rem',
  },
  instructionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  instructionStep: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--bg-input)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  stepNumBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },
};

export default RecipeDetails;
