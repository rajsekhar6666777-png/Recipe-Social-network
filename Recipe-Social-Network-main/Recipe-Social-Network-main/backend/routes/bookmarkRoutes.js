const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookmarkController.toggleBookmark);
router.get('/', authMiddleware, bookmarkController.getBookmarks);

module.exports = router;
