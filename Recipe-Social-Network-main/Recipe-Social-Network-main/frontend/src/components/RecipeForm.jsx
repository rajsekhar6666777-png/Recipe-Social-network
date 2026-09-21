import React, { useState } from 'react';
import { FaPlus, FaTrash, FaImage, FaClock, FaUtensils, FaCheck } from 'react-icons/fa';

const CATEGORIES = ['Starter', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Beverages', 'Salad', 'Soup', 'Street Food', 'Vegan', 'Vegetarian', 'Gluten-Free'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const RecipeForm = ({ initialValues = {}, onSubmit, isEditing = false, loading = false }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [category, setCategory] = useState(initialValues.category || 'Dinner');
  const [difficulty, setDifficulty] = useState(initialValues.difficulty || 'Easy');
  const [prepTime, setPrepTime] = useState(initialValues.prep_time || 15);
  const [cookTime, setCookTime] = useState(initialValues.cook_time || 30);
  const [servings, setServings] = useState(initialValues.servings || 4);

  // Parse initial ingredients line-by-line
  const [ingredients, setIngredients] = useState(() => {
    if (initialValues.ingredients) {
      return initialValues.ingredients.split('\n').filter((i) => i.trim());
    }
    return ['', ''];
  });

  // Parse initial instructions line-by-line
  const [instructions, setInstructions] = useState(() => {
    if (initialValues.instructions) {
      return initialValues.instructions.split('\n').filter((i) => i.trim());
    }
    return ['', ''];
  });

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialValues.image || '');
  const [imagePreview, setImagePreview] = useState(initialValues.image || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleRemoveInstruction = (index) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };
  const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedIngredients = ingredients.filter((item) => item.trim()).join('\n');
    const formattedInstructions = instructions.filter((item) => item.trim()).join('\n');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('difficulty', difficulty);
    formData.append('prep_time', prepTime);
    formData.append('cook_time', cookTime);
    formData.append('servings', servings);
    formData.append('ingredients', formattedIngredients);
    formData.append('instructions', formattedInstructions);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('image_url', imageUrl);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Title & Category Row */}
      <div style={styles.row}>
        <div className="form-group" style={{ flex: 2 }}>
          <label className="form-label">Recipe Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Creamy Tuscan Garlic Chicken"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Category *</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Difficulty *</label>
          <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {DIFFICULTIES.map((diff) => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Short Description *</label>
        <textarea
          className="form-textarea"
          rows="3"
          placeholder="Brief summary describing flavor profile, occasion, or texture..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Preparation Meta */}
      <div style={styles.row}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label"><FaClock /> Prep Time (mins)</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label"><FaClock /> Cook Time (mins)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label"><FaUtensils /> Servings</label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Image Upload / URL */}
      <div className="form-group">
        <label className="form-label"><FaImage /> Recipe Photo</label>
        <div style={styles.imageUploadArea}>
          {imagePreview ? (
            <div style={styles.previewContainer}>
              <img src={imagePreview} alt="Preview" style={styles.previewImage} />
            </div>
          ) : (
            <div style={styles.uploadPlaceholder}>
              <FaImage style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }} />
              <p>Upload a high-resolution photo of your dish</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.75rem' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="recipe-image-file"
              style={{ display: 'none' }}
            />
            <label htmlFor="recipe-image-file" className="btn btn-outline" style={{ flex: 1 }}>
              Browse File...
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="Or paste Image URL..."
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
              style={{ flex: 2 }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Ingredients Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Ingredients List *</h4>
          <button type="button" onClick={handleAddIngredient} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            <FaPlus /> Add Ingredient
          </button>
        </div>

        {ingredients.map((ing, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder={`Ingredient ${idx + 1} (e.g. 2 tbsp Olive Oil)`}
              value={ing}
              onChange={(e) => handleIngredientChange(idx, e.target.value)}
              required
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                style={styles.removeBtn}
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Dynamic Instructions Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Cooking Instructions (Step-by-Step) *</h4>
          <button type="button" onClick={handleAddInstruction} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
            <FaPlus /> Add Step
          </button>
        </div>

        {instructions.map((inst, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
            <span style={styles.stepBadge}>{idx + 1}</span>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder={`Step ${idx + 1} instructions...`}
              value={inst}
              onChange={(e) => handleInstructionChange(idx, e.target.value)}
              required
            />
            {instructions.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveInstruction(idx)}
                style={styles.removeBtn}
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2.25rem', fontSize: '1rem' }}
        >
          <FaCheck /> {loading ? 'Saving Recipe...' : isEditing ? 'Update Recipe' : 'Publish Recipe'}
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  imageUploadArea: {
    padding: '1.25rem',
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--bg-input)',
  },
  previewContainer: {
    width: '100%',
    maxHeight: '260px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '260px',
    objectFit: 'cover',
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.5rem 0',
    color: 'var(--text-muted)',
  },
  section: {
    background: 'var(--bg-card)',
    padding: '1.25rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#e63946',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  stepBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
    marginTop: '6px',
  },
};

export default RecipeForm;
