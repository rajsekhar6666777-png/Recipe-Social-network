const { query } = require('../config/db');

// Toggle Bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ success: false, message: 'Recipe ID is required.' });
    }

    const existing = await query('SELECT * FROM bookmarks WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);

    let isBookmarked = false;

    if (existing && existing.length > 0) {
      await query('DELETE FROM bookmarks WHERE recipe_id = ? AND user_id = ?', [recipeId, userId]);
      isBookmarked = false;
    } else {
      await query('INSERT INTO bookmarks (recipe_id, user_id) VALUES (?, ?)', [recipeId, userId]);
      isBookmarked = true;
    }

    res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Saved to bookmarks!' : 'Removed from bookmarks.',
    });
  } catch (error) {
    console.error('Toggle Bookmark Error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling bookmark.' });
  }
};

// Get User Bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    const recipes = await query(
      `SELECT r.*, 
        u.name as author_name, 
        u.profile_image as author_image,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) as comments_count,
        1 as is_bookmarked,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id AND user_id = ?) as is_liked
      FROM bookmarks b
      JOIN recipes r ON b.recipe_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [userId, userId]
    );

    res.json({
      success: true,
      count: recipes.length,
      recipes: recipes.map((r) => ({
        ...r,
        is_bookmarked: true,
        is_liked: Boolean(r.is_liked),
      })),
    });
  } catch (error) {
    console.error('Get Bookmarks Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookmarks.' });
  }
};
