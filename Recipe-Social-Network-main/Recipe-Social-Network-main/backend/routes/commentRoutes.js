const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:recipeId', commentController.getComments);
router.post('/', authMiddleware, commentController.addComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
