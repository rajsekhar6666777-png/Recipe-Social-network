const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Meal Plan routes
router.get('/meal-plan', plannerController.getMealPlan);
router.post('/meal-plan', plannerController.addMealPlanItem);
router.delete('/meal-plan/:id', plannerController.deleteMealPlanItem);

// Shopping List routes
router.get('/shopping-list', plannerController.getShoppingList);
router.post('/shopping-list', plannerController.addShoppingItem);
router.put('/shopping-list/:id/toggle', plannerController.toggleShoppingItem);
router.delete('/shopping-list/:id', plannerController.deleteShoppingItem);

module.exports = router;
