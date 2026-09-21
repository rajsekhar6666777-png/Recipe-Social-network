import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { toast } from 'react-toastify';
import api from '../services/api';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/recipes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Recipe published successfully!');
        navigate(`/recipe/${response.data.recipeId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Share a New Recipe</h1>
        <p className="page-subtitle">Inspire food enthusiasts around the world with your culinary creations.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <RecipeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default CreateRecipe;
