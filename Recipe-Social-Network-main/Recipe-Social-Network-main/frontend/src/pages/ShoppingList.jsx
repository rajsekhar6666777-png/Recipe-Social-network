import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaTrash, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import api from '../services/api';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/planner/shopping-list');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      toast.error('Failed to load shopping list.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      const res = await api.post('/planner/shopping-list', { itemText: newItemText.trim() });
      if (res.data.success) {
        setItems([res.data.item, ...items]);
        setNewItemText('');
        toast.success('Item added!');
      }
    } catch (err) {
      toast.error('Failed to add item.');
    }
  };

  const handleToggleItem = async (id) => {
    try {
      const res = await api.put(`/planner/shopping-list/${id}/toggle`);
      if (res.data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, is_completed: res.data.isCompleted } : item))
        );
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await api.delete(`/planner/shopping-list/${id}`);
      if (res.data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  if (loading) return <Loader text="Loading your grocery shopping list..." />;

  const completedCount = items.filter((i) => i.is_completed).length;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaShoppingCart style={{ color: 'var(--primary)' }} /> Grocery Shopping List
        </h1>
        <p className="page-subtitle">Check off ingredients as you shop at the supermarket.</p>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Add item (e.g. 2 cups Olive Oil, Fresh Basil)..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <FaPlus /> Add
        </button>
      </form>

      {/* Items Container */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span>Total Items: {items.length}</span>
          <span>Completed: {completedCount} / {items.length}</span>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Your shopping list is empty. Export recipe ingredients or add custom items!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => handleToggleItem(item.id)}
              >
                {item.is_completed ? (
                  <FaCheckCircle style={{ color: 'var(--secondary)', fontSize: '1.1rem' }} />
                ) : (
                  <FaRegCircle style={{ color: 'var(--text-light)', fontSize: '1.1rem' }} />
                )}
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.95rem',
                    textDecoration: item.is_completed ? 'line-through' : 'none',
                    opacity: item.is_completed ? 0.6 : 1,
                  }}
                >
                  {item.item_text}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  style={{ background: 'none', border: 'none', color: '#e63946', cursor: 'pointer' }}
                  title="Delete item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
