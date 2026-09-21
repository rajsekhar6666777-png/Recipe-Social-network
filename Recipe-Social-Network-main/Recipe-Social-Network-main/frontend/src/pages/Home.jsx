import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaFire, FaClock, FaFilter, FaCompass, FaStar } from 'react-icons/fa';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import api from '../services/api';

const CATEGORIES = ['All', 'Starter', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Salad', 'Soup'];

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRecipes();
  }, [activeCategory, activeDifficulty, sortBy, page]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recipes', {
        params: {
          category: activeCategory,
          difficulty: activeDifficulty,
          sort: sortBy,
          page,
          limit: 9,
        },
      });

      if (response.data.success) {
        setRecipes(response.data.recipes);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Header Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <span className="badge badge-category" style={{ marginBottom: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <FaFire style={{ color: '#e07a5f' }} /> Foodie Social Network
          </span>
          <h1 style={styles.heroTitle}>
            Discover & Share Delicious Culinary Masterpieces
          </h1>
          <p style={styles.heroSubtitle}>
            Join thousands of home cooks and professional chefs. Share your secret family recipes, rate dishes, save favorites, and connect with global food lovers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/explore">
              <button className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <FaCompass /> Explore All Recipes
              </button>
            </Link>
            <Link to="/create-recipe">
              <button className="btn btn-outline" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <FaUtensils /> Post Your Recipe
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={styles.pillsRow}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setPage(1);
              }}
              style={{
                ...styles.pillBtn,
                background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                color: activeCategory === cat ? '#fff' : 'var(--text-main)',
                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border-color)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Filter & Sort Bar */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
          <FaFilter style={{ color: 'var(--primary)' }} />
          <span>Filters:</span>
          <select
            value={activeDifficulty}
            onChange={(e) => {
              setActiveDifficulty(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
          >
            <option value="newest">Latest Recipes</option>
            <option value="most_liked">Most Liked</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Feed Recipe Grid */}
      {loading ? (
        <Loader text="Fetching community recipes..." />
      ) : recipes.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No recipes found</h3>
          <p>Be the first chef to share a recipe in this category!</p>
          <Link to="/create-recipe" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <button className="btn btn-primary">Create Recipe</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </>
      )}
    </div>
  );
};

const styles = {
  heroSection: {
    padding: '3.5rem 1.5rem',
    borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, rgba(224, 122, 95, 0.12) 0%, rgba(129, 178, 154, 0.12) 100%)',
    textAlign: 'center',
    marginBottom: '2.5rem',
    border: '1px solid var(--border-color)',
  },
  heroContent: {
    maxWidth: '750px',
    margin: '0 auto',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1.2',
    color: 'var(--text-main)',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  pillsRow: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    scrollbarWidth: 'none',
  },
  pillBtn: {
    padding: '0.55rem 1.35rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    fontWeight: '600',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
  },
};

export default Home;
