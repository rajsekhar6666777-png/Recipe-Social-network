const { query } = require('../config/db');

// Get All Recipes with Search, Filters, Ratings, Views, and Pagination
exports.getRecipes = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      cuisine,
      maxCalories,
      minRating,
      search,
      author,
      section,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;

    let sql = `
      SELECT 
        r.*, 
        u.name as author_name, 
        u.profile_image as author_image,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) as comments_count,
        COALESCE((SELECT AVG(rating) FROM ratings WHERE recipe_id = r.id), 0) as avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id) as rating_count
    `;

    if (currentUserId) {
      sql += `,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as is_liked,
        (SELECT COUNT(*) FROM bookmarks WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as is_bookmarked,
        (SELECT rating FROM ratings WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as user_rating
      `;
    } else {
      sql += `, 0 as is_liked, 0 as is_bookmarked, 0 as user_rating`;
    }

    sql += ` FROM recipes r JOIN users u ON r.user_id = u.id WHERE 1=1`;
    const params = [];

    if (category && category !== 'All') {
      sql += ` AND r.category = ?`;
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      sql += ` AND r.difficulty = ?`;
      params.push(difficulty);
    }

    if (cuisine && cuisine !== 'All') {
      sql += ` AND r.cuisine = ?`;
      params.push(cuisine);
    }

    if (maxCalories) {
      sql += ` AND r.calories <= ?`;
      params.push(parseInt(maxCalories));
    }

    if (search) {
      sql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ? OR u.name LIKE ? OR r.category LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);

      // Log search history if user is logged in
      if (currentUserId) {
        try {
          await query('INSERT INTO search_history (user_id, query) VALUES (?, ?)', [currentUserId, search.trim()]);
        } catch (e) {}
      }
    }

    if (author) {
      sql += ` AND r.user_id = ?`;
      params.push(author);
    }

    if (minRating) {
      sql += ` HAVING avg_rating >= ?`;
      params.push(parseFloat(minRating));
    }

    // Section presets
    if (section === 'trending' || section === 'popular') {
      sql += ` ORDER BY views_count DESC, likes_count DESC`;
    } else if (section === 'top_rated') {
      sql += ` ORDER BY avg_rating DESC, rating_count DESC`;
    } else if (sort === 'highest_rated') {
      sql += ` ORDER BY avg_rating DESC, r.created_at DESC`;
    } else if (sort === 'most_viewed') {
      sql += ` ORDER BY r.views_count DESC, r.created_at DESC`;
    } else if (sort === 'oldest') {
      sql += ` ORDER BY r.created_at ASC`;
    } else if (sort === 'most_liked') {
      sql += ` ORDER BY likes_count DESC, r.created_at DESC`;
    } else {
      sql += ` ORDER BY r.created_at DESC`;
    }

    // Total count query for pagination
    let countSql = `SELECT COUNT(*) as total FROM recipes r JOIN users u ON r.user_id = u.id WHERE 1=1`;
    const countParams = [];

    if (category && category !== 'All') {
      countSql += ` AND r.category = ?`;
      countParams.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      countSql += ` AND r.difficulty = ?`;
      countParams.push(difficulty);
    }

    if (cuisine && cuisine !== 'All') {
      countSql += ` AND r.cuisine = ?`;
      countParams.push(cuisine);
    }

    if (maxCalories) {
      countSql += ` AND r.calories <= ?`;
      countParams.push(parseInt(maxCalories));
    }

    if (search) {
      countSql += ` AND (r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ? OR u.name LIKE ? OR r.category LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (author) {
      countSql += ` AND r.user_id = ?`;
      countParams.push(author);
    }

    const countRes = await query(countSql, countParams);
    const total = countRes[0] ? parseInt(countRes[0].total) : 0;
    const totalPages = Math.ceil(total / parseInt(limit)) || 1;

    // Cap requested page to totalPages if out of bounds (e.g. searching when on page 5)
    const requestedPage = parseInt(page) || 1;
    const activePage = Math.min(requestedPage, totalPages) || 1;

    const offset = (activePage - 1) * parseInt(limit);
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    console.log('EXECUTING FEED SQL:', sql, 'PARAMS:', params);
    const recipes = await query(sql, params);
    console.log('RETURNED RECIPES COUNT:', recipes.length, 'TOTAL:', total, 'TOTAL PAGES:', totalPages);

    res.json({
      success: true,
      count: recipes.length,
      total,
      totalPages,
      page: activePage,
      recipes: recipes.map((r) => ({
        ...r,
        is_liked: Boolean(r.is_liked),
        is_bookmarked: Boolean(r.is_bookmarked),
        avg_rating: parseFloat(r.avg_rating || 0).toFixed(1),
      })),
    });
  } catch (error) {
    console.error('Get Recipes Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching recipes.' });
  }
};

// Get Single Recipe Details
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    let sql = `
      SELECT 
        r.*, 
        u.name as author_name, 
        u.profile_image as author_image,
        u.bio as author_bio,
        u.country as author_country,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) as comments_count,
        COALESCE((SELECT AVG(rating) FROM ratings WHERE recipe_id = r.id), 0) as avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id) as rating_count
    `;

    if (currentUserId) {
      sql += `,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as is_liked,
        (SELECT COUNT(*) FROM bookmarks WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as is_bookmarked,
        (SELECT rating FROM ratings WHERE recipe_id = r.id AND user_id = ${parseInt(currentUserId)}) as user_rating
      `;
    } else {
      sql += `, 0 as is_liked, 0 as is_bookmarked, 0 as user_rating`;
    }

    sql += ` FROM recipes r JOIN users u ON r.user_id = u.id WHERE r.id = ?`;

    const recipes = await query(sql, [id]);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    const recipe = recipes[0];

    // Related recipes in same category or cuisine
    const related = await query(
      `SELECT r.id, r.title, r.image, r.category, r.prep_time, r.cook_time, r.views_count,
        COALESCE((SELECT AVG(rating) FROM ratings WHERE recipe_id = r.id), 0) as avg_rating
       FROM recipes r WHERE r.category = ? AND r.id != ? LIMIT 3`,
      [recipe.category, recipe.id]
    );

    res.json({
      success: true,
      recipe: {
        ...recipe,
        is_liked: Boolean(recipe.is_liked),
        is_bookmarked: Boolean(recipe.is_bookmarked),
        avg_rating: parseFloat(recipe.avg_rating || 0).toFixed(1),
        related: related.map((rel) => ({
          ...rel,
          avg_rating: parseFloat(rel.avg_rating || 0).toFixed(1),
        })),
      },
    });
  } catch (error) {
    console.error('Get Recipe By ID Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching recipe details.' });
  }
};

// Increment Views Count
exports.trackView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    await query('UPDATE recipes SET views_count = views_count + 1 WHERE id = ?', [id]);
    await query('INSERT INTO views (recipe_id, user_id) VALUES (?, ?)', [id, userId]);

    res.json({ success: true, message: 'View recorded.' });
  } catch (error) {
    console.error('Track View Error:', error);
    res.status(500).json({ success: false, message: 'Failed to record view.' });
  }
};

// Search Autocomplete Suggestions & History
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user ? req.user.id : null;

    if (!q || q.trim().length < 2) {
      // Return recent search history if logged in
      let recent = [];
      if (userId) {
        recent = await query('SELECT DISTINCT query FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
      }
      return res.json({ success: true, suggestions: [], recent: recent.map((r) => r.query) });
    }

    const pattern = `%${q.trim()}%`;
    const titleMatches = await query('SELECT id, title, category, image FROM recipes WHERE title LIKE ? LIMIT 5', [pattern]);
    const categoriesMatches = await query('SELECT DISTINCT category FROM recipes WHERE category LIKE ? LIMIT 3', [pattern]);

    let recent = [];
    if (userId) {
      recent = await query('SELECT DISTINCT query FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]);
    }

    res.json({
      success: true,
      suggestions: titleMatches,
      categories: categoriesMatches.map((c) => c.category),
      recent: recent.map((r) => r.query),
    });
  } catch (error) {
    console.error('Search Suggestions Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching search suggestions.' });
  }
};

// Create New Recipe
exports.createRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, ingredients, instructions, prep_time, cook_time, servings, category, difficulty, cuisine, calories } = req.body;

    if (!title || !description || !ingredients || !instructions || !category) {
      return res.status(400).json({ success: false, message: 'Required recipe fields missing.' });
    }

    let image = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image = req.body.image_url;
    }

    const result = await query(
      `INSERT INTO recipes 
      (user_id, title, description, ingredients, instructions, prep_time, cook_time, servings, category, difficulty, cuisine, calories, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        description,
        ingredients,
        instructions,
        parseInt(prep_time) || 15,
        parseInt(cook_time) || 30,
        parseInt(servings) || 4,
        category,
        difficulty || 'Easy',
        cuisine || 'Global',
        parseInt(calories) || 350,
        image,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Recipe published successfully!',
      recipeId: result.insertId,
    });
  } catch (error) {
    console.error('Create Recipe Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating recipe.' });
  }
};

// Update Recipe
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, ingredients, instructions, prep_time, cook_time, servings, category, difficulty, cuisine, calories } = req.body;

    const existing = await query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this recipe.' });
    }

    let image = existing[0].image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image = req.body.image_url;
    }

    await query(
      `UPDATE recipes SET 
      title = ?, description = ?, ingredients = ?, instructions = ?, 
      prep_time = ?, cook_time = ?, servings = ?, category = ?, difficulty = ?, cuisine = ?, calories = ?, image = ? 
      WHERE id = ?`,
      [
        title,
        description,
        ingredients,
        instructions,
        parseInt(prep_time) || 15,
        parseInt(cook_time) || 30,
        parseInt(servings) || 4,
        category,
        difficulty,
        cuisine || 'Global',
        parseInt(calories) || 350,
        image,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Recipe updated successfully!',
    });
  } catch (error) {
    console.error('Update Recipe Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating recipe.' });
  }
};

// Delete Recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await query('SELECT * FROM recipes WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this recipe.' });
    }

    await query('DELETE FROM recipes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Recipe deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Recipe Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting recipe.' });
  }
};

// Get User's Created Recipes
exports.getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;

    const recipes = await query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE recipe_id = r.id) as comments_count,
        COALESCE((SELECT AVG(rating) FROM ratings WHERE recipe_id = r.id), 0) as avg_rating
      FROM recipes r WHERE r.user_id = ? ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: recipes.length,
      recipes: recipes.map((r) => ({
        ...r,
        avg_rating: parseFloat(r.avg_rating || 0).toFixed(1),
      })),
    });
  } catch (error) {
    console.error('Get User Recipes Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user recipes.' });
  }
};
