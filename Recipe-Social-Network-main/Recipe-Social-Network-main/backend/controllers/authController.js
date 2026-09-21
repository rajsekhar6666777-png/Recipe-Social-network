const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_recipe_social_key_2026';

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, bio, country, fav_cuisine } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO users 
      (name, email, password, profile_image, bio, country, fav_cuisine) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, profile_image, bio || 'Food enthusiast & recipe lover', country || 'Global Chef', fav_cuisine || 'International']
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: '7d' });

    const newUser = {
      id: userId,
      name,
      email,
      profile_image,
      bio: bio || 'Food enthusiast & recipe lover',
      country: country || 'Global Chef',
      fav_cuisine: fav_cuisine || 'International',
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
      cover_image: user.cover_image,
      bio: user.bio,
      country: user.country,
      website: user.website,
      instagram: user.instagram,
      fav_cuisine: user.fav_cuisine,
    };

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    const users = await query(
      `SELECT id, name, email, profile_image, cover_image, bio, country, website, instagram, fav_cuisine, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    const recipes = await query('SELECT COUNT(*) as count FROM recipes WHERE user_id = ?', [userId]);
    const followers = await query('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [userId]);
    const following = await query('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?', [userId]);

    let isFollowing = false;
    if (req.user && req.user.id !== parseInt(userId)) {
      const followCheck = await query('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [
        req.user.id,
        userId,
      ]);
      isFollowing = followCheck && followCheck.length > 0;
    }

    res.json({
      success: true,
      user: {
        ...user,
        stats: {
          recipesCount: recipes[0]?.count || 0,
          followersCount: followers[0]?.count || 0,
          followingCount: following[0]?.count || 0,
        },
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, country, website, instagram, fav_cuisine } = req.body;

    let profile_image = undefined;
    let cover_image = undefined;

    if (req.files) {
      if (req.files.profile_image) profile_image = `/uploads/${req.files.profile_image[0].filename}`;
      if (req.files.cover_image) cover_image = `/uploads/${req.files.cover_image[0].filename}`;
    } else if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
    }

    let updateSql = 'UPDATE users SET name = ?, bio = ?, country = ?, website = ?, instagram = ?, fav_cuisine = ?';
    let params = [name, bio, country, website, instagram, fav_cuisine];

    if (profile_image) {
      updateSql += ', profile_image = ?';
      params.push(profile_image);
    }
    if (cover_image) {
      updateSql += ', cover_image = ?';
      params.push(cover_image);
    }

    updateSql += ' WHERE id = ?';
    params.push(userId);

    await query(updateSql, params);

    const updatedUser = await query(
      'SELECT id, name, email, profile_image, cover_image, bio, country, website, instagram, fav_cuisine FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser[0],
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid current and new password (min 6 chars) required.' });
    }

    const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};
