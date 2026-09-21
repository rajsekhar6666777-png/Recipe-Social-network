const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.post('/', authMiddleware, followController.toggleFollow);
router.get('/followers/:userId', optionalAuth, followController.getFollowers);
router.get('/following/:userId', optionalAuth, followController.getFollowing);

module.exports = router;
