# 📚 Recipe Social Network - Technical Documentation

Welcome to the technical documentation for the **Recipe Social Network** full-stack platform.

---

## 🏗️ 1. Architecture Overview

The system follows a classic **Client-Server-Database Architecture** with decoupled layers for maximum scalability and maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Frontend                        │
│             React 18 + Vite + SPA Router + Tailwind         │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / HTTP)
┌──────────────────────────────▼──────────────────────────────┐
│                      Express Backend                        │
│         Auth JWT Middleware + Multer File Uploader          │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL Query Layer (db.js)
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   ┌────────────────────┐            ┌────────────────────┐
   │    MySQL Engine    │            │ SQLite DB Fallback │
   │ (Production Mode)  │            │(recipe_social.db)  │
   └────────────────────┘            └────────────────────┘
```

---

## 🗄️ 2. Database Schema & Tables

The system supports **10 Relational Tables** designed for relational integrity and foreign key constraints.

### ER Diagram Overview

- **`users`**: User account credentials, bios, avatars, cover photos, and country details.
- **`recipes`**: Core recipe data (title, ingredients, instructions, cooking times, category, cuisine, image path, views count).
- **`ratings`**: 1 to 5 star ratings submitted by users per recipe (Unique constraint on `recipe_id, user_id`).
- **`comments`**: User comments linked to specific recipes.
- **`likes`**: User likes on recipes.
- **`bookmarks`**: User saved recipes.
- **`followers`**: Social follow graph (`follower_id` -> `following_id`).
- **`notifications`**: User activity alerts (likes, comments, follows).
- **`meal_plans`**: Scheduled recipes assigned to day of week & meal type.
- **`shopping_list`**: Ingredient checklist items for users.

---

### Table Specifications

#### `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT / INTEGER | Primary Key, Auto Increment | Unique User ID |
| `username` | VARCHAR(80) | Default NULL | Custom username |
| `name` | VARCHAR(100) | NOT NULL | Display Full Name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | User Login Email |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt Hashed Password |
| `profile_image` | VARCHAR(255) | Default NULL | Profile Avatar URL |
| `cover_image` | VARCHAR(255) | Default NULL | Profile Header Banner |
| `bio` | TEXT | Default NULL | Chef Biography |
| `country` | VARCHAR(100) | Default 'Global Chef' | Country of origin |
| `fav_cuisine` | VARCHAR(100) | Default 'International'| Favorite Cuisine Specialty |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration Date |

#### `recipes` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT / INTEGER | Primary Key, Auto Increment | Unique Recipe ID |
| `user_id` | INT / INTEGER | Foreign Key -> `users(id)` | Author Chef ID |
| `title` | VARCHAR(255) | NOT NULL | Recipe Title |
| `description` | TEXT | NOT NULL | Short Summary |
| `ingredients` | TEXT | NOT NULL | Newline-separated Ingredients |
| `instructions` | TEXT | NOT NULL | Step-by-step Instructions |
| `prep_time` | INT | DEFAULT 15 | Preparation Time (mins) |
| `cook_time` | INT | DEFAULT 30 | Cooking Time (mins) |
| `servings` | INT | DEFAULT 4 | Portion Servings Count |
| `category` | VARCHAR(50) | NOT NULL | E.g. Breakfast, Lunch, Starter, Dessert |
| `difficulty` | VARCHAR(20) | DEFAULT 'Easy' | Easy, Medium, Hard |
| `cuisine` | VARCHAR(50) | DEFAULT 'Global' | Indian, Italian, South Indian, etc. |
| `calories` | INT | DEFAULT 350 | Calorie Count (kcal) |
| `image` | VARCHAR(255) | Default NULL | Image Path / Server URL |
| `views_count` | INT | DEFAULT 0 | Total Page Views Count |

---

## 🔌 3. API Reference

Base Server Endpoint: `http://localhost:5000/api`

### 🔑 Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "Chef Lakshmi",
    "email": "lakshmi@example.com",
    "password": "password123",
    "country": "India",
    "fav_cuisine": "South Indian"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": { "id": 4, "name": "Chef Lakshmi", "email": "lakshmi@example.com" }
  }
  ```

#### `POST /api/auth/login`
Authenticates a user and returns a JWT Bearer Token.
- **Request Body**:
  ```json
  { "email": "gordon@example.com", "password": "password123" }
  ```

#### `GET /api/auth/profile`
Retrieves current authenticated user's profile info (Requires `Authorization: Bearer <token>`).

---

### 🥗 Recipe Routes (`/api/recipes`)

#### `GET /api/recipes`
Fetches paginated recipe feed with support for search and category filtering.
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 12)
  - `search` (optional string search in title, description, ingredients, author)
  - `category` (optional: Breakfast, Lunch, Dinner, Starter, Dessert, Beverages, Salad, Soup, Street Food, Vegan, Vegetarian)
  - `cuisine` (optional: Indian, South Indian, Italian, Japanese, Mexican, French, Spanish, Thai, Asian, Mediterranean, Global)
- **Response**:
  ```json
  {
    "success": true,
    "recipes": [ ... ],
    "total": 60,
    "page": 1,
    "totalPages": 5
  }
  ```

#### `GET /api/recipes/:id`
Returns complete details of a specific recipe, incrementing `views_count`.

#### `POST /api/recipes`
Creates a new recipe (Requires Auth JWT & Multipart File Upload).

---

### ❤️ Social Routes

- **`POST /api/likes/toggle`**: Like / Unlike a recipe (`{ "recipe_id": 5 }`).
- **`POST /api/bookmarks/toggle`**: Bookmark / Unbookmark a recipe.
- **`POST /api/ratings`**: Submit a rating from 1 to 5 stars (`{ "recipe_id": 5, "rating": 5 }`).
- **`POST /api/comments`**: Add a comment (`{ "recipe_id": 5, "comment": "Amazing flavor!" }`).
- **`POST /api/follow/:id`**: Follow / Unfollow a chef by User ID.

---

## ⚡ 4. Dual Database & Hybrid Engine

The backend `config/db.js` module automatically negotiates database connections:

1. **MySQL Attempt**:
   - Reads `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` from `.env`.
   - Creates `recipe_social_db` database and pool connection if MySQL server is running locally or remotely.
2. **SQLite Automatic Fallback**:
   - If MySQL connection fails or is unavailable, automatically initializes embedded SQLite database at `backend/recipe_social.db`.
   - Ensures **zero downtime** and instant local testing out-of-the-box.
3. **Database Sync Script**:
   - Run `node sync_database.js` in `backend/` to apply `seed.sql` and re-seed all 60 recipes with verified local photos on both database engines simultaneously.

---

## 🖼️ 5. Image Localization System

All recipe images are stored in `backend/uploads/`:

- **User Uploads**:
  - `panipuri.png` (Crispy Pani Puri #55)
  - `gobi65.png` (Spicy Gobi 65 #58)
  - `chole_bhature.jpg` (Delhi Chole Bhature #56)
  - `bajji.png` (Stuffed Mirchi Bajji #43)
  - `samosa.png` (Punjabi Potato Samosa #59)
- **Locally Downloaded Curated Food Images**:
  - `perfect_food_1.jpg` through `perfect_food_60.jpg`
  - Eliminates external HTTP 404s, CORS restrictions, or broken stock photos.

---

## 🔧 6. Maintenance Commands

```bash
# In backend directory:

# Re-seed database & verify 60 recipes
node sync_database.js

# Run backend development server with hot reload
npm run dev
```

```bash
# In frontend directory:

# Start Vite React frontend
npm run dev

# Build production bundle
npm run build
```
