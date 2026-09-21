const { query } = require('../config/db');

// Get Weekly Meal Plan
exports.getMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const plans = await query(
      `SELECT m.*, r.title as recipe_title, r.image as recipe_image, r.category, r.prep_time, r.cook_time 
       FROM meal_plans m 
       JOIN recipes r ON m.recipe_id = r.id 
       WHERE m.user_id = ? 
       ORDER BY m.created_at ASC`,
      [userId]
    );

    res.json({
      success: true,
      mealPlan: plans,
    });
  } catch (error) {
    console.error('Get Meal Plan Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching meal plan.' });
  }
};

// Add Recipe to Meal Plan
exports.addMealPlanItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId, dayOfWeek, mealType } = req.body;

    if (!recipeId || !dayOfWeek || !mealType) {
      return res.status(400).json({ success: false, message: 'Recipe ID, day of week, and meal type are required.' });
    }

    const result = await query(
      'INSERT INTO meal_plans (user_id, recipe_id, day_of_week, meal_type) VALUES (?, ?, ?, ?)',
      [userId, recipeId, dayOfWeek, mealType]
    );

    res.status(201).json({
      success: true,
      message: `Added to ${dayOfWeek} ${mealType}!`,
      planId: result.insertId,
    });
  } catch (error) {
    console.error('Add Meal Plan Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding meal plan.' });
  }
};

// Delete Meal Plan Item
exports.deleteMealPlanItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query('DELETE FROM meal_plans WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Removed from meal plan.',
    });
  } catch (error) {
    console.error('Delete Meal Plan Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting meal plan item.' });
  }
};

// Get Shopping List Items
exports.getShoppingList = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await query(
      'SELECT * FROM shopping_list WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      items: items.map((i) => ({ ...i, is_completed: Boolean(i.is_completed) })),
    });
  } catch (error) {
    console.error('Get Shopping List Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching shopping list.' });
  }
};

// Add Item or Export Recipe Ingredients to Shopping List
exports.addShoppingItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemText, recipeId } = req.body;

    if (recipeId) {
      // Export all ingredients from recipe to shopping list
      const recipes = await query('SELECT ingredients FROM recipes WHERE id = ?', [recipeId]);
      if (recipes && recipes.length > 0) {
        const ingredients = recipes[0].ingredients.split('\n').filter((i) => i.trim());
        for (const ing of ingredients) {
          await query('INSERT INTO shopping_list (user_id, item_text) VALUES (?, ?)', [userId, ing.trim()]);
        }
        return res.json({
          success: true,
          message: `${ingredients.length} ingredients exported to your Shopping List!`,
        });
      }
    } else if (itemText && itemText.trim()) {
      const result = await query('INSERT INTO shopping_list (user_id, item_text) VALUES (?, ?)', [userId, itemText.trim()]);
      return res.status(201).json({
        success: true,
        message: 'Item added to shopping list.',
        item: { id: result.insertId, user_id: userId, item_text: itemText.trim(), is_completed: false },
      });
    }

    res.status(400).json({ success: false, message: 'Item text or recipe ID required.' });
  } catch (error) {
    console.error('Add Shopping Item Error:', error);
    res.status(500).json({ success: false, message: 'Server error adding to shopping list.' });
  }
};

// Toggle Shopping List Item Completion
exports.toggleShoppingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await query('SELECT is_completed FROM shopping_list WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const newStatus = existing[0].is_completed ? 0 : 1;
    await query('UPDATE shopping_list SET is_completed = ? WHERE id = ? AND user_id = ?', [newStatus, id, userId]);

    res.json({
      success: true,
      isCompleted: Boolean(newStatus),
    });
  } catch (error) {
    console.error('Toggle Shopping Item Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating item.' });
  }
};

// Delete Shopping List Item
exports.deleteShoppingItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query('DELETE FROM shopping_list WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Item deleted.',
    });
  } catch (error) {
    console.error('Delete Shopping Item Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting item.' });
  }
};
