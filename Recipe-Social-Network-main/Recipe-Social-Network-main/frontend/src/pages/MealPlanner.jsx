import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaPlus, FaTrash, FaShoppingCart, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlanner = () => {
  const { user } = useAuth();

  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRecipes, setMyRecipes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedMealType, setSelectedMealType] = useState('Dinner');
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

  useEffect(() => {
    fetchMealPlan();
    fetchUserRecipes();
  }, []);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const response = await api.get('/planner/meal-plan');
      if (response.data.success) {
        setMealPlan(response.data.mealPlan);
      }
    } catch (err) {
      toast.error('Failed to load meal plan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const res = await api.get('/recipes');
      if (res.data.success) {
        setMyRecipes(res.data.recipes);
        if (res.data.recipes.length > 0) setSelectedRecipeId(res.data.recipes[0].id);
      }
    } catch (e) {}
  };

  const handleOpenAddModal = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!selectedRecipeId) return toast.error('Please select a recipe.');

    try {
      const res = await api.post('/planner/meal-plan', {
        recipeId: selectedRecipeId,
        dayOfWeek: selectedDay,
        mealType: selectedMealType,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchMealPlan();
        setModalOpen(false);
      }
    } catch (err) {
      toast.error('Failed to add recipe to meal plan.');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      const res = await api.delete(`/planner/meal-plan/${id}`);
      if (res.data.success) {
        setMealPlan((prev) => prev.filter((m) => m.id !== id));
        toast.success('Recipe removed from plan.');
      }
    } catch (err) {
      toast.error('Failed to remove meal.');
    }
  };

  const handleExportShoppingList = async (recipeId) => {
    try {
      const res = await api.post('/planner/shopping-list', { recipeId });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to export ingredients to shopping list.');
    }
  };

  if (loading) return <Loader text="Loading your weekly meal planner..." />;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FaCalendarAlt style={{ color: 'var(--primary)' }} /> Weekly Meal Planner
          </h1>
          <p className="page-subtitle">Schedule your breakfasts, lunches, and dinners for the week ahead.</p>
        </div>

        <Link to="/shopping-list">
          <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}>
            <FaShoppingCart /> View Shopping List
          </button>
        </Link>
      </div>

      {/* Weekly Grid */}
      <div style={styles.grid}>
        {DAYS.map((day) => (
          <div key={day} className="glass-card" style={styles.dayCard}>
            <div style={styles.dayHeader}>
              <h3>{day}</h3>
            </div>

            <div style={styles.mealsContainer}>
              {MEAL_TYPES.map((mealType) => {
                const planItems = mealPlan.filter((m) => m.day_of_week === day && m.meal_type === mealType);

                return (
                  <div key={mealType} style={styles.mealSlot}>
                    <div style={styles.slotHeader}>
                      <span style={styles.slotTitle}>{mealType}</span>
                      <button
                        onClick={() => handleOpenAddModal(day, mealType)}
                        style={styles.addBtn}
                        title={`Add ${mealType} for ${day}`}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    {planItems.length === 0 ? (
                      <div style={styles.emptySlot}>Empty slot</div>
                    ) : (
                      planItems.map((item) => (
                        <div key={item.id} style={styles.plannedMealCard}>
                          <div style={{ flex: 1 }}>
                            <Link to={`/recipe/${item.recipe_id}`} style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                              {item.recipe_title}
                            </Link>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <button
                                onClick={() => handleExportShoppingList(item.recipe_id)}
                                style={styles.actionIconBtn}
                                title="Export ingredients to Shopping List"
                              >
                                <FaShoppingCart /> List
                              </button>
                              <button
                                onClick={() => handleDeleteMeal(item.id)}
                                style={{ ...styles.actionIconBtn, color: '#e63946' }}
                                title="Remove meal"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className="glass-card" style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem' }}>
              Add Meal to {selectedDay} ({selectedMealType})
            </h3>

            <form onSubmit={handleAddMeal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Select Recipe</label>
                <select
                  className="form-select"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                >
                  {myRecipes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FaPlus /> Add to Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  dayCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dayHeader: {
    borderBottom: '2px solid var(--primary)',
    paddingBottom: '0.5rem',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  mealsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mealSlot: {
    background: 'var(--bg-input)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
  },
  slotHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  slotTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  addBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
    padding: '0.2rem',
  },
  emptySlot: {
    fontSize: '0.775rem',
    color: 'var(--text-light)',
    fontStyle: 'italic',
  },
  plannedMealCard: {
    background: 'var(--bg-card)',
    padding: '0.65rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    marginBottom: '0.4rem',
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    maxWidth: '460px',
    width: '90%',
    padding: '2rem',
  },
};

export default MealPlanner;
