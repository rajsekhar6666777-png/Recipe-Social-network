import React, { useState, useEffect } from 'react';
import { FaBookmark } from 'react-icons/fa';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import api from '../services/api';

const Bookmarks = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookmarks');
      if (response.data.success) {
        setRecipes(response.data.recipes);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = (recipeId, isBookmarked) => {
    if (!isBookmarked) {
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaBookmark style={{ color: 'var(--primary)' }} /> Saved Favorite Recipes
        </h1>
        <p className="page-subtitle">Your personal cookbook of saved recipes for quick reference in the kitchen.</p>
      </div>

      {loading ? (
        <Loader text="Loading your saved cookbook..." />
      ) : recipes.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>No saved recipes yet</h3>
          <p>Click the bookmark icon on any recipe card to save it here for later!</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onBookmarkToggle={handleBookmarkToggle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
