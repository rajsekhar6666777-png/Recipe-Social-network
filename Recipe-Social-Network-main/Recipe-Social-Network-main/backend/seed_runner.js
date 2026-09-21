const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  const dbPath = path.join(__dirname, 'recipe_social.db');
  console.log('Opening SQLite database at:', dbPath);

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  const seedSqlPath = path.join(__dirname, 'config', 'seed.sql');
  let seedSql = fs.readFileSync(seedSqlPath, 'utf-8');

  // Strip MySQL-only statements
  seedSql = seedSql
    .replace(/USE\s+recipe_social_db;/gi, '')
    .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');

  // Clear existing tables
  await db.exec('PRAGMA foreign_keys = OFF;');
  await db.exec('DELETE FROM likes;');
  await db.exec('DELETE FROM comments;');
  await db.exec('DELETE FROM ratings;');
  await db.exec('DELETE FROM recipes;');
  await db.exec('DELETE FROM users;');
  await db.exec('PRAGMA foreign_keys = ON;');

  console.log('Cleared existing database tables.');

  // Execute full SQL script in one atomic execution
  await db.exec(seedSql);

  const recipes = await db.all('SELECT id, title, category, cuisine, difficulty FROM recipes ORDER BY id ASC');
  console.log(`\n✅ Seed completed successfully! Total recipes in DB: ${recipes.length}\n`);
  console.table(recipes);

  const countsByCategory = await db.all('SELECT category, COUNT(*) as count FROM recipes GROUP BY category ORDER BY count DESC');
  console.log('\n📊 Recipes by Category:');
  console.table(countsByCategory);

  const countsByCuisine = await db.all('SELECT cuisine, COUNT(*) as count FROM recipes GROUP BY cuisine ORDER BY count DESC');
  console.log('\n🌐 Recipes by Cuisine:');
  console.table(countsByCuisine);

  await db.close();
}

runSeed().catch((err) => {
  console.error('Failed to run seed script:', err);
});
