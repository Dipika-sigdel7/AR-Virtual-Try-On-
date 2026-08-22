# ShopNow

## Structure

```
shopnow/
├── frontend/
│   ├── pages/        index.html, products.html, services.html, about.html
│   ├── css/          style.css, products.css, services.css, about.css
│   └── js/           app.js, products.js, services.js, about.js
└── backend/
    ├── server.js
    ├── config/db.js       single MySQL pool (mysql2)
    ├── middleware/adminAuth.js
    ├── routes/
    │   ├── productRoutes.js        public: GET /api/products, /api/products/:id, /api/products/categories
    │   └── adminProductRoutes.js   admin (requires x-admin-token header): CRUD at /api/admin/products
    └── database/schema.sql
```

## Setup

1. `cd backend && npm install`
2. `cp .env.example .env` and fill in your MySQL credentials + an `ADMIN_TOKEN`
3. Run `backend/database/schema.sql` against your MySQL server to create the database, tables, and seed categories
4. `npm start`

## What changed from the original zip

- **Removed `node_modules/`** from the package — install via `npm install` instead.
- **Merged `backend/db.js` and `backend/config/db.js`** (near-duplicate MySQL configs) into one: `config/db.js`.
- **Removed the SQLite path entirely** (`init-db.js`, `database/database.sql`, `database/ecommerce.db`) and the old flat-`category` MySQL schema (`database/products.sql`). Replaced both with a single `database/schema.sql`: MySQL, with a proper `categories` table and `products.category_id` foreign key.
- **Rewrote `adminProductRoutes.js`** to use `category_id` instead of a free-text `category` column, so it now matches the schema `productRoutes.js` already assumed. Previously these two route files disagreed and one of them would have failed against any single database.
- **Moved both route files into `backend/routes/`** for consistency (one used to sit loose in `backend/`).
- **Removed the duplicate `/api/products` mount and a duplicate `POST /admin` product-creation route** in the old `productRoutes.js` — creation now only happens through the admin-authenticated `/api/admin/products` route.
- **Renamed frontend files to lowercase** (`About.html` → `about.html`, etc.) and moved HTML pages into `frontend/pages/`, keeping `css/` and `js/` at the frontend root.
- **Standardized all internal links** to absolute, clean routes (`/`, `/products`, `/services`, `/about`) and absolute asset paths (`/css/...`, `/js/...`) — the original mixed relative paths, absolute paths, and raw `.html` links across different pages, so navigation behaved inconsistently depending on which page you started from.
- Added `.env.example` and an `npm start` script.

## Note

`package-lock.json` was carried over as-is; run `npm install` after setup to regenerate it against the trimmed dependency list (sqlite3 removed).
