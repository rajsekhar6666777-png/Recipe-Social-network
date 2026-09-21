const { query } = require('../config/db');

// Submit or Update Rating for a Recipe
exports.submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId, rating } = req.body;

    const numRating = parseInt(rating);
    if (!recipeId || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Valid rating between 1 and 5 is required.' });
    }

    const recipes = await query('SELECT user_id, title FROM recipes WHERE id = ?', [recipeId]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const recipe = recipes[0];
    const existing = await query('SELECT * FROM ratings WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);

    if (existing && existing.length > 0) {
      await query('UPDATE ratings SET rating = ? WHERE recipe_id = ? AND user_id = ?', [numRating, recipeId, userId]);
    } else {
      await query('INSERT INTO ratings (recipe_id, user_id, rating) VALUES (?, ?, ?)', [recipeId, userId, numRating]);

      // Notify recipe owner
      if (recipe.user_id !== userId) {
        const rater = await query('SELECT name FROM users WHERE id = ?', [userId]);
        const senderName = rater[0]?.name || 'Someone';

        await query(
          `INSERT INTO notifications (user_id, sender_id, recipe_id, type, message) 
           VALUES (?, ?, ?, 'rating', ?)`,
          [recipe.user_id, userId, recipeId, `${senderName} rated your recipe "${recipe.title}" ${numRating} stars ⭐`]
        );
      }
    }

    // Get updated average rating
    const stats = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM ratings WHERE recipe_id = ?',
      [recipeId]
    );

    const avgRating = parseFloat(stats[0]?.avg_rating || 0).toFixed(1);
    const ratingCount = stats[0]?.rating_count || 0;

    res.json({
      success: true,
      message: 'Rating submitted successfully!',
      avgRating,
      ratingCount,
      userRating: numRating,
    });
  } catch (error) {
    console.error('Submit Rating Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing rating.' });
  }
};

// Get Rating Summary for a Recipe
exports.getRecipeRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user ? req.user.id : null;

    const stats = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM ratings WHERE recipe_id = ?',
      [recipeId]
    );

    let userRating = 0;
    if (userId) {
      const userRes = await query('SELECT rating FROM ratings WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);
      if (userRes && userRes.length > 0) {
        userRating = userRes[0].rating;
      }
    }

    const avgRating = parseFloat(stats[0]?.avg_rating || 0).toFixed(1);
    const ratingCount = stats[0]?.rating_count || 0;

    res.json({
      success: true,
      avgRating,
      ratingCount,
      userRating,
    });
  } catch (error) {
    console.error('Get Rating Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ratings.' });
  }
};
