const { query } = require('../config/db');

// Get User Notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await query(
      `SELECT n.*, u.name as sender_name, u.profile_image as sender_image
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [userId]
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
};

// Mark Notifications as Read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body;

    if (notificationId) {
      await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, userId]);
    } else {
      await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    }

    res.json({
      success: true,
      message: 'Notifications marked as read.',
    });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications.' });
  }
};

// Get Dashboard Stats for Authenticated User
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalRecipesRes = await query('SELECT COUNT(*) as count FROM recipes WHERE user_id = ?', [userId]);
    const totalLikesRes = await query(
      'SELECT COUNT(*) as count FROM likes l JOIN recipes r ON l.recipe_id = r.id WHERE r.user_id = ?',
      [userId]
    );
    const followersRes = await query('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [userId]);
    const followingRes = await query('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?', [userId]);
    const savedRes = await query('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', [userId]);
    const totalViewsRes = await query('SELECT SUM(views_count) as total FROM recipes WHERE user_id = ?', [userId]);

    const recentActivity = await query(
      `SELECT n.*, u.name as sender_name, u.profile_image as sender_image 
       FROM notifications n 
       LEFT JOIN users u ON n.sender_id = u.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        totalRecipes: totalRecipesRes[0]?.count || 0,
        totalLikes: totalLikesRes[0]?.count || 0,
        followersCount: followersRes[0]?.count || 0,
        followingCount: followingRes[0]?.count || 0,
        savedRecipesCount: savedRes[0]?.count || 0,
        totalViews: totalViewsRes[0]?.total || 0,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats.' });
  }
};

// Get Analytics Charts & Top Recipe Data
exports.getAnalyticsCharts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Recipes per category distribution
    const categoriesData = await query(
      `SELECT category, COUNT(*) as count FROM recipes WHERE user_id = ? GROUP BY category`,
      [userId]
    );

    // Top viewed recipes for user
    const topViewed = await query(
      `SELECT id, title, views_count, image, category FROM recipes WHERE user_id = ? ORDER BY views_count DESC LIMIT 4`,
      [userId]
    );

    // Top rated recipes overall for user
    const topRated = await query(
      `SELECT r.id, r.title, r.image, COALESCE(AVG(rt.rating), 0) as avg_rating, COUNT(rt.id) as rating_count
       FROM recipes r 
       LEFT JOIN ratings rt ON r.id = rt.recipe_id
       WHERE r.user_id = ? 
       GROUP BY r.id
       ORDER BY avg_rating DESC, rating_count DESC LIMIT 4`,
      [userId]
    );

    // Monthly activity sample (mock data mapped for visual charts)
    const monthlyActivity = [
      { month: 'Jan', recipes: 2, likes: 14 },
      { month: 'Feb', recipes: 3, likes: 28 },
      { month: 'Mar', recipes: 1, likes: 45 },
      { month: 'Apr', recipes: 4, likes: 62 },
      { month: 'May', recipes: 2, likes: 88 },
      { month: 'Jun', recipes: 5, likes: 110 },
      { month: 'Jul', recipes: 4, likes: 135 },
    ];

    res.json({
      success: true,
      categoriesData,
      topViewed,
      topRated: topRated.map((r) => ({ ...r, avg_rating: parseFloat(r.avg_rating || 0).toFixed(1) })),
      monthlyActivity,
    });
  } catch (error) {
    console.error('Analytics Charts Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating charts.' });
  }
};
