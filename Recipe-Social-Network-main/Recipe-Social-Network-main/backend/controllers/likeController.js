const { query } = require('../config/db');

// Toggle Like / Unlike Recipe
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
    }

    const recipes = await query('SELECT user_id, title FROM recipes WHERE id = ?', [recipeId]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const recipe = recipes[0];
    const existing = await query('SELECT * FROM likes WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);

    let isLiked = false;

    if (existing && existing.length > 0) {
      // Unlike
      await query('DELETE FROM likes WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);
      isLiked = false;
    } else {
      // Like
      await query('INSERT INTO likes (recipe_id, user_id) VALUES (?, ?)', [recipeId, userId]);
      isLiked = true;

      // Send notification to author if not liking own recipe
      if (recipe.user_id !== userId) {
        const liker = await query('SELECT name FROM users WHERE id = ?', [userId]);
        const senderName = liker[0]?.name || 'Someone';

        await query(
          `INSERT INTO notifications (user_id, sender_id, recipe_id, type, message) 
           VALUES (?, ?, ?, 'like', ?)`,
          [recipe.user_id, userId, recipeId, `${senderName} liked your recipe "${recipe.title}"`]
        );
      }
    }

    const countResult = await query('SELECT COUNT(*) as count FROM likes WHERE recipe_id = ?', [recipeId]);
    const likesCount = countResult[0]?.count || 0;

    res.json({
      success: true,
      isLiked,
      likesCount,
      message: isLiked ? 'Recipe liked!' : 'Recipe unliked.',
    });
  } catch (error) {
    console.error('Toggle Like Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing like.' });
  }
};
