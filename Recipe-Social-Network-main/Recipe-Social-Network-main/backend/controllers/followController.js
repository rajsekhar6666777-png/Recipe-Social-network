const { query } = require('../config/db');

// Toggle Follow / Unfollow
exports.toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ success: false, message: 'Following user ID is required.' });
    }

    if (parseInt(followerId) === parseInt(followingId)) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetUser = await query('SELECT name FROM users WHERE id = ?', [followingId]);
    if (!targetUser || targetUser.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const existing = await query('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [
      followerId,
      followingId,
    ]);

    let isFollowing = false;

    if (existing && existing.length > 0) {
      await query('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
      isFollowing = false;
    } else {
      await query('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
      isFollowing = true;

      // Send notification
      const follower = await query('SELECT name FROM users WHERE id = ?', [followerId]);
      const followerName = follower[0]?.name || 'Someone';

      await query(
        `INSERT INTO notifications (user_id, sender_id, type, message) 
         VALUES (?, ?, 'follow', ?)`,
        [followingId, followerId, `${followerName} started following you`]
      );
    }

    const followersCount = await query('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [followingId]);

    res.json({
      success: true,
      isFollowing,
      followersCount: followersCount[0]?.count || 0,
      message: isFollowing ? `You are now following ${targetUser[0].name}.` : `Unfollowed ${targetUser[0].name}.`,
    });
  } catch (error) {
    console.error('Toggle Follow Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing follow.' });
  }
};

// Get Followers List
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const followers = await query(
      `SELECT u.id, u.name, u.email, u.profile_image, u.bio,
        (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as recipes_count
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [userId]
    );

    // Check if current user follows each user in list
    const mapped = await Promise.all(
      followers.map(async (user) => {
        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
          const check = await query('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [
            currentUserId,
            user.id,
          ]);
          isFollowing = check && check.length > 0;
        }
        return { ...user, isFollowing };
      })
    );

    res.json({
      success: true,
      count: mapped.length,
      followers: mapped,
    });
  } catch (error) {
    console.error('Get Followers Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching followers.' });
  }
};

// Get Following List
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const following = await query(
      `SELECT u.id, u.name, u.email, u.profile_image, u.bio,
        (SELECT COUNT(*) FROM recipes WHERE user_id = u.id) as recipes_count
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [userId]
    );

    const mapped = await Promise.all(
      following.map(async (user) => {
        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
          const check = await query('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [
            currentUserId,
            user.id,
          ]);
          isFollowing = check && check.length > 0;
        }
        return { ...user, isFollowing };
      })
    );

    res.json({
      success: true,
      count: mapped.length,
      following: mapped,
    });
  } catch (error) {
    console.error('Get Following Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching following list.' });
  }
};
