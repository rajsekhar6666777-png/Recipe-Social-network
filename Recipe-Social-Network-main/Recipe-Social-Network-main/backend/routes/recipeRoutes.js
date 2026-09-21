const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/search/suggestions', optionalAuth, recipeController.getSearchSuggestions);
router.get('/user/:userId', recipeController.getUserRecipes);
router.get('/:id', optionalAuth, recipeController.getRecipeById);
router.post('/:id/view', optionalAuth, recipeController.trackView);
router.post('/', authMiddleware, upload.single('image'), recipeController.createRecipe);
router.put('/:id', authMiddleware, upload.single('image'), recipeController.updateRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);

module.exports = router;
