import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import api from '../services/api';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const res = await api.get(`/recipes/${id}`);
      if (res.data.success) {
        setRecipe(res.data.recipe);
      }
    } catch (err) {
      toast.error('Failed to load recipe for editing.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/recipes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Recipe updated successfully!');
        navigate(`/recipe/${id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update recipe.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading recipe details for edit..." />;
  if (!recipe) return <div style={{ textAlign: 'center', padding: '3rem' }}>Recipe not found.</div>;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Edit Recipe</h1>
        <p className="page-subtitle">Update ingredients, measurements, or step-by-step instructions.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <RecipeForm initialValues={recipe} onSubmit={handleSubmit} isEditing={true} loading={submitting} />
      </div>
    </div>
  );
};

export default EditRecipe;
