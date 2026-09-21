const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbPool = null;
let sqliteDb = null;
let isMySQL = false;

async function initDB() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

  try {
    const connection = await mysql.createConnection({
      host: DB_HOST || 'localhost',
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      port: DB_PORT || 3306,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME || 'recipe_social_db'}\`;`);
    await connection.end();

    dbPool = mysql.createPool({
      host: DB_HOST || 'localhost',
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'recipe_social_db',
      port: DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });

    const [rows] = await dbPool.query('SELECT 1');
    isMySQL = true;
    console.log('✅ Connected to MySQL database successfully.');
    await createTablesMySQL();
    return;
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL server:', err.message);
    console.log('🔄 Falling back to embedded SQLite engine for instant testing capability...');
  }

  const dbPath = path.join(__dirname, '..', 'recipe_social.db');
  sqliteDb = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  isMySQL = false;
  console.log('✅ Embedded SQLite database initialized at:', dbPath);
  await createTablesSQLite();
}

async function createTablesMySQL() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const statements = schemaSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('create database') && !s.toLowerCase().startsWith('use'));

  for (const stmt of statements) {
    try {
      await dbPool.query(stmt);
    } catch (e) {}
  }

  await addMissingColumnsMySQL();
  await forceSeedSouthIndianMySQL();
}

async function addMissingColumnsMySQL() {
  const userCols = [
    'cover_image VARCHAR(255) DEFAULT NULL',
    'country VARCHAR(100) DEFAULT "Global Chef"',
    'website VARCHAR(255) DEFAULT NULL',
    'instagram VARCHAR(150) DEFAULT NULL',
    'fav_cuisine VARCHAR(100) DEFAULT "International"',
    'username VARCHAR(80) DEFAULT NULL'
  ];
  for (const col of userCols) {
    try {
      await dbPool.query(`ALTER TABLE users ADD COLUMN ${col}`);
    } catch (e) {}
  }

  const recipeCols = [
    'cuisine VARCHAR(50) DEFAULT "Global"',
    'calories INT DEFAULT 350',
    'views_count INT DEFAULT 0'
  ];
  for (const col of recipeCols) {
    try {
      await dbPool.query(`ALTER TABLE recipes ADD COLUMN ${col}`);
    } catch (e) {}
  }
}

async function forceSeedSouthIndianMySQL() {
  try {
    const [countRes] = await dbPool.query('SELECT COUNT(*) as count FROM recipes');
    if (!countRes || countRes[0].count === 0) {
      console.log('🌱 Seeding recipes into MySQL from seed.sql...');
      const seedSqlPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedSqlPath)) {
        const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');
        await dbPool.query('SET FOREIGN_KEY_CHECKS = 0; DELETE FROM likes; DELETE FROM comments; DELETE FROM ratings; DELETE FROM recipes; DELETE FROM users; SET FOREIGN_KEY_CHECKS = 1;');
        await dbPool.query(seedSql);
      }
    }
  } catch (e) {
    console.error('MySQL Seeding Error:', e.message);
  }
}

async function createTablesSQLite() {
  await sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT DEFAULT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      profile_image TEXT DEFAULT NULL,
      cover_image TEXT DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      country TEXT DEFAULT 'Global Chef',
      website TEXT DEFAULT NULL,
      instagram TEXT DEFAULT NULL,
      fav_cuisine TEXT DEFAULT 'International',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      prep_time INTEGER DEFAULT 15,
      cook_time INTEGER DEFAULT 30,
      servings INTEGER DEFAULT 4,
      category TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Easy',
      cuisine TEXT DEFAULT 'Global',
      calories INTEGER DEFAULT 350,
      image TEXT DEFAULT NULL,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recipe_id, user_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      query TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recipe_id, user_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(recipe_id, user_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sender_id INTEGER DEFAULT NULL,
      recipe_id INTEGER DEFAULT NULL,
      type TEXT DEFAULT 'general',
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await addMissingColumnsSQLite();
  await forceSeedSouthIndianSQLite();
}

async function forceSeedSouthIndianSQLite() {
  try {
    const countRes = await sqliteDb.get('SELECT COUNT(*) as count FROM recipes');
    if (!countRes || countRes.count === 0) {
      console.log('🌱 Seeding recipes into SQLite from seed.sql...');
      const seedSqlPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedSqlPath)) {
        let seedSql = fs.readFileSync(seedSqlPath, 'utf-8')
          .replace(/USE\s+recipe_social_db;/gi, '')
          .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');
        await sqliteDb.exec('PRAGMA foreign_keys = OFF; DELETE FROM likes; DELETE FROM comments; DELETE FROM ratings; DELETE FROM recipes; DELETE FROM users; PRAGMA foreign_keys = ON;');
        await sqliteDb.exec(seedSql);
      }
    }
  } catch (e) {
    console.error('SQLite Seeding Error:', e.message);
  }
}

async function query(sql, params = []) {
  if (isMySQL && dbPool) {
    const [rows] = await dbPool.query(sql, params);
    return rows;
  } else if (sqliteDb) {
    const lowerSql = sql.trim().toLowerCase();
    if (lowerSql.startsWith('select')) {
      return await sqliteDb.all(sql, params);
    } else {
      const result = await sqliteDb.run(sql, params);
      return { insertId: result.lastID, affectedRows: result.changes };
    }
  } else {
    throw new Error('Database not initialized');
  }
}

async function reseedDB(seedSql) {
  if (isMySQL && dbPool) {
    await dbPool.query('SET FOREIGN_KEY_CHECKS = 0');
    await dbPool.query('DELETE FROM likes');
    await dbPool.query('DELETE FROM comments');
    await dbPool.query('DELETE FROM ratings');
    await dbPool.query('DELETE FROM recipes');
    await dbPool.query('DELETE FROM users');
    await dbPool.query('SET FOREIGN_KEY_CHECKS = 1');
    await dbPool.query(seedSql);
    console.log('✅ MySQL Database successfully reseeded.');
  }

  if (sqliteDb) {
    const sqliteSql = seedSql
      .replace(/USE\s+recipe_social_db;/gi, '')
      .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO');
    await sqliteDb.exec('PRAGMA foreign_keys = OFF;');
    await sqliteDb.exec('DELETE FROM likes;');
    await sqliteDb.exec('DELETE FROM comments;');
    await sqliteDb.exec('DELETE FROM ratings;');
    await sqliteDb.exec('DELETE FROM recipes;');
    await sqliteDb.exec('DELETE FROM users;');
    await sqliteDb.exec('PRAGMA foreign_keys = ON;');
    await sqliteDb.exec(sqliteSql);
    console.log('✅ SQLite Database successfully reseeded.');
  }
}

module.exports = {
  initDB,
  query,
  reseedDB,
};

