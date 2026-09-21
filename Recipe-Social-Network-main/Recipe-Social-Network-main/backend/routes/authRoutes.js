const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', upload.single('profile_image'), authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/profile/:id', authController.getProfile);
router.put(
  '/profile',
  authMiddleware,
  upload.fields([
    { name: 'profile_image', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 },
  ]),
  authController.updateProfile
);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
