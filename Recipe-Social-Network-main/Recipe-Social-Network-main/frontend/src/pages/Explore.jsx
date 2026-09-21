import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaCompass, FaFire, FaStar, FaEye } from 'react-icons/fa';
import RecipeCard from '../components/RecipeCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import Pagination from '../components/Pagination';
import api from '../services/api';

const CATEGORIES = ['All', 'Starter', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Beverages', 'Salad', 'Soup', 'Street Food', 'Vegan', 'Vegetarian', 'Gluten-Free'];
const CUISINES = ['All', 'South Indian', 'Indian', 'Italian', 'Mexican', 'Japanese', 'American', 'Mediterranean', 'French', 'Chinese', 'Thai', 'Spanish', 'British', 'Asian', 'Global'];
const SECTIONS = [
  { id: 'all', label: 'All Recipes', icon: FaCompass },
  { id: 'trending', label: 'Trending 🔥', icon: FaFire },
  { id: 'top_rated', label: 'Top Rated ⭐', icon: FaStar },
  { id: 'popular', label: 'Most Viewed 👁', icon: FaEye },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const [recipes, setRecipes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploreRecipes();
  }, [searchQuery, category, cuisine, difficulty, activeSection, sort, page]);

  const fetchExploreRecipes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recipes', {
        params: {
          search: searchQuery,
          category,
          cuisine,
          difficulty,
          section: activeSection,
          sort,
          page,
          limit: 12,
        },
      });

      if (res.data.success) {
        setRecipes(res.data.recipes);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search: searchQuery, category, cuisine, difficulty, section: activeSection, sort });
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <FaCompass style={{ color: 'var(--primary)' }} /> Explore Recipe Social
        </h1>
        <p className="page-subtitle">Discover authentic South Indian delicacies, global flavors, or filter by cooking difficulty and category.</p>
      </div>

      {/* Explore Section Tabs */}
      <div style={styles.sectionTabs}>
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                setPage(1);
              }}
              style={{
                ...styles.sectionTabBtn,
                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-main)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
              }}
            >
              <Icon /> {sec.label}
            </button>
          );
        })}
      </div>

      {/* Main Search & Filters Box */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: 3, minWidth: '240px' }}>
            <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by recipe name (e.g. Masala Dosa, Biryani), ingredient, or chef..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', flex: 1, minWidth: '130px' }}>
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600' }}>
            <FaFilter style={{ color: 'var(--primary)' }} /> Category:
            <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600' }}>
            Cuisine:
            <select className="form-select" value={cuisine} onChange={(e) => { setCuisine(e.target.value); setPage(1); }}>
              {CUISINES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600' }}>
            Difficulty:
            <select className="form-select" value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: '600' }}>
            Sort By:
            <select className="form-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
              <option value="newest">Latest Uploads</option>
              <option value="highest_rated">Highest Rated ⭐</option>
              <option value="most_viewed">Most Viewed 👁</option>
              <option value="most_liked">Most Liked ❤️</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <SkeletonGrid count={8} />
      ) : recipes.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <h3>No matching recipes found</h3>
          <p>Try searching for different terms or reset your active filters.</p>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}
    </div>
  );
};

const styles = {
  sectionTabs: {
    display: 'flex',
    gap: '0.85rem',
    justifyContent: 'center',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
  },
  sectionTabBtn: {
    padding: '0.65rem 1.35rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'var(--transition)',
  },
};

export default Explore;
