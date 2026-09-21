const { query } = require('../config/db');

// Get comments for a recipe
exports.getComments = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const comments = await query(
      `SELECT c.*, u.name as user_name, u.profile_image as user_image 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.recipe_id = ? 
       ORDER BY c.created_at DESC`,
      [recipeId]
    );

    res.json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching comments.' });
  }
};

// Add a comment to a recipe
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId, comment } = req.body;

    if (!recipeId || !comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Recipe ID and comment text are required.' });
    }

    // Check if recipe exists
    const recipes = await query('SELECT user_id, title FROM recipes WHERE id = ?', [recipeId]);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const recipe = recipes[0];

    const result = await query(
      'INSERT INTO comments (recipe_id, user_id, comment) VALUES (?, ?, ?)',
      [recipeId, userId, comment.trim()]
    );

    // Notify recipe owner if commenter is not the owner
    if (recipe.user_id !== userId) {
      const commenter = await query('SELECT name FROM users WHERE id = ?', [userId]);
      const senderName = commenter[0]?.name || 'Someone';

      await query(
        `INSERT INTO notifications (user_id, sender_id, recipe_id, type, message) 
         VALUES (?, ?, ?, 'comment', ?)`,
        [recipe.user_id, userId, recipeId, `${senderName} commented on your recipe "${recipe.title}"`]
      );
    }

    // Get the created comment with user info
    const newComments = await query(
      `SELECT c.*, u.name as user_name, u.profile_image as user_image 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      comment: newComments[0],
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding comment.' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comments = await query('SELECT * FROM comments WHERE id = ?', [id]);
    if (!comments || comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comments[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment.' });
    }

    await query('DELETE FROM comments WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Comment deleted.',
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting comment.' });
  }
};
