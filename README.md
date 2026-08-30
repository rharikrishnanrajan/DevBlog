# Developer-Centric Personal Blog Platform

> A simple, minimalist, developer-focused personal blog posting and publishing platform. Write a blog, publish it to MySQL, and showcase it on a clean public web application.

---

## 1. Project Description

The **Developer-Centric Personal Blog Platform** is built with simplicity, speed, and clean software architecture in mind. It eliminates unnecessary complexity (no bloated dashboards, complex auth layers, or heavy frameworks) while delivering a responsive, production-ready developer blog.

### Key Capabilities:
- **Public Feed**: Chronological list of published blogs with titles, dates, read-times, and snippet previews.
- **Blog Reader**: Clean typography and reader view preserving formatting and line breaks.
- **Publisher (`/admin/create`)**: Fast authoring form to write and publish blogs to MySQL with instant redirect.
- **Manager (`/admin/create`)**: View, edit, or delete existing posts with safety confirmations.
- **Editor (`/admin/edit/:id`)**: Update existing blog titles and contents seamlessly.
- **Blog Detail View (`/blog/:id`)**: Read, edit, or delete individual blog posts with confirmation dialogs.

---

## 2. Technology Stack

- **Frontend**: AngularJS (1.8.x), HTML5, CSS3, JavaScript (SPA with Hash-Bang Routing for GitHub Pages).
- **Backend**: Node.js, Express.js, REST API (`mysql2/promise`, `cors`, `dotenv`).
- **Database**: Aiven MySQL 8.x (`blog` database, `posts` table).
- **Hosting / Deployment**:
  - Frontend: **GitHub Pages**
  - Backend: **Node.js hosting** (Render, Railway, Heroku, or VPS)
  - Database: **Aiven Cloud MySQL**

---

## 3. Architecture & Project Structure

```text
                  ┌──────────────────────┐
                  │     GitHub Pages     │
                  │      AngularJS       │
                  │   Frontend (SPA)     │
                  └──────────┬───────────┘
                             │
                             │ REST API (JSON / CORS)
                             ▼
                  ┌──────────────────────┐
                  │ Node.js + Express.js │
                  │     REST Backend     │
                  └──────────┬───────────┘
                             │
                             │ MySQL (SSL / mysql2 Pool)
                             ▼
                  ┌──────────────────────┐
                  │      Aiven MySQL     │
                  │     Database: blog   │
                  └──────────────────────┘
```

### Folder Structure

```text
Developer-Centric Personal Blog Platform/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: auto-deploy frontend to GitHub Pages
│
├── database/
│   └── schema.sql              # MySQL table schema
│
├── backend/
│   ├── server.js               # Express application entry point
│   ├── package.json            # Node.js dependencies & scripts
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Ignores .env and node_modules
│   ├── config/
│   │   └── database.js         # MySQL connection pool with SSL
│   ├── controllers/
│   │   └── postController.js   # CRUD controllers with validation
│   ├── routes/
│   │   └── postRoutes.js       # REST endpoint route definitions
│   └── README.md
│
├── frontend/
│   ├── index.html              # HTML5 single page shell (API URL injected here)
│   ├── package.json            # Local dev server config
│   ├── README.md               # Frontend docs
│   └── app/
│       ├── app.js              # Module, routes & API_URL config
│       ├── controllers/
│       │   ├── blogController.js   # Blog listing & single post
│       │   └── adminController.js  # Create, edit, and delete
│       ├── services/
│       │   └── blogService.js      # REST API client ($http)
│       ├── views/
│       │   ├── home.html           # Homepage blog stream
│       │   ├── blog-detail.html    # Full blog post view
│       │   ├── create-blog.html    # Blog authoring & management
│       │   └── edit-blog.html      # Blog modification
│       └── styles/
│           └── style.css           # Developer theme stylesheet
│
├── render.yaml                 # Render IaC: one-click backend deployment
└── README.md                   # Main documentation
```

---

## 4. MySQL Database Setup

Execute the SQL script located at `database/schema.sql` in your MySQL database to create the `blog` database and `posts` table:

```sql
CREATE DATABASE IF NOT EXISTS blog;
USE blog;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> **Note**: The backend automatically verifies and creates the `posts` table on startup if it doesn't exist, but creating the database manually is still required.

---

## 5. Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Server Port
PORT=5000

# Aiven MySQL Credentials
DB_HOST=your-aiven-mysql-host.aivencloud.com
DB_PORT=27008
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=blog

# Optional CORS origin (e.g. your GitHub Pages domain)
FRONTEND_URL=*
```

> **Security Note:** The `.env` file is excluded in `.gitignore` and must never be committed to source control.

---

## 6. How to Run the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server (default: http://localhost:5000)
npm start

# Or start in development mode with auto-reload
npm run dev
```

---

## 7. How to Run the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Option 1: Start using npx serve
npx serve .

# Option 2: Start using Python HTTP server
python -m http.server 8080
```

Open `http://localhost:3000` (or `http://localhost:8080`) in your browser.

---

## 8. REST API Endpoints

Base URL: `/api/posts`

| Method | Endpoint | Description | Request Body | Response (Success) |
|---|---|---|---|---|
| `GET` | `/api/posts` | Retrieve all blogs | None | `200 OK` (Array of posts) |
| `GET` | `/api/posts/:id` | Retrieve single blog | None | `200 OK` (Post object) or `404` |
| `POST` | `/api/posts` | Create new blog | `{ "title": "...", "content": "..." }` | `201 Created` (`{ "message": "...", "id": 1 }`) |
| `PUT` | `/api/posts/:id` | Update existing blog | `{ "title": "...", "content": "..." }` | `200 OK` (`{ "message": "Blog updated successfully" }`) |
| `DELETE` | `/api/posts/:id` | Delete blog | None | `200 OK` (`{ "message": "Blog deleted successfully" }`) |
| `GET` | `/api/health` | Service health status | None | `200 OK` (`{ "status": "ok" }`) |

---

## 9. Deployment

This project uses **GitHub Actions** for automated frontend deployment to GitHub Pages, and **Render** for backend hosting.

### Architecture at a Glance

```
GitHub (push to main)
       │
       ▼
GitHub Actions (deploy.yml)
       │  injects API_URL secret into index.html
       │  publishes frontend/ → gh-pages branch
       ▼
GitHub Pages  ←──── users visit ──── https://<user>.github.io/<repo>/
       │
       │ HTTP requests to /api/*
       ▼
Render (Node.js)  ←── auto-deploys from backend/ via render.yaml
       │
       ▼
Aiven MySQL (cloud)
```

---

### Step 1 — Deploy the Backend to Render

1. Push this repository to GitHub.
2. Go to [https://dashboard.render.com/](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect your GitHub repository. Render will detect `render.yaml` and auto-configure the service.
4. In the Render dashboard, open the service → **Environment** tab and set:
   | Key | Value |
   |-----|-------|
   | `DB_HOST` | `mysql-xxxx.aivencloud.com` |
   | `DB_PORT` | `27008` |
   | `DB_USER` | `avnadmin` |
   | `DB_PASSWORD` | *(your Aiven password)* |
   | `DB_NAME` | `blog` |
   | `FRONTEND_URL` | `https://<yourusername>.github.io` |
5. Copy your Render service URL — it looks like `https://developer-blog-backend.onrender.com`.

---

### Step 2 — Set the API_URL Secret in GitHub

1. Open your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `API_URL`, Value: `https://developer-blog-backend.onrender.com/api`
4. Click **Add secret**.

---

### Step 3 — Enable GitHub Pages

1. In your GitHub repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages` / `/ (root)`
3. Click **Save**.

> ⚠️ The `gh-pages` branch is created automatically by the GitHub Actions workflow on the first push. Enable Pages **after** the first workflow run completes.

---

### Step 4 — Push to Deploy

```bash
git add .
git commit -m "feat: add GitHub Pages deployment"
git push origin main
```

The GitHub Actions workflow will:
1. Inject your `API_URL` secret into `frontend/index.html`
2. Publish the `frontend/` folder to the `gh-pages` branch
3. GitHub Pages serves the site at `https://<yourusername>.github.io/<repo-name>/`

Your live blog URL: **`https://<yourusername>.github.io/<repository-name>/`**

*(Hash-bang routing `#!/` ensures all deep-links like `/#!/blog/:id` work correctly on GitHub Pages without 404s.)*



---

## 10. Aiven MySQL Configuration

1. Log into your [Aiven Console](https://console.aiven.io/).
2. Select your MySQL service.
3. Under **Databases**, create a database named `blog`.
4. Locate the **Connection parameters**:
   - **Host**: (e.g. `mysql-xxxx.aivencloud.com`)
   - **Port**: `27008` (or your service port)
   - **User**: `avnadmin`
   - **Password**: Found in the Overview tab.
5. In your MySQL client or CLI, run `database/schema.sql` to create the `posts` table (or let the backend auto-initialize it on startup).
6. The backend pool automatically enables SSL with `rejectUnauthorized: false` to connect securely to Aiven.

---

## 11. Development & Testing Commands Summary

```bash
# Start backend (development mode with auto-reload)
cd backend && npm run dev

# Start backend (production mode)
cd backend && npm start

# Start frontend
cd frontend && npx serve .
```
