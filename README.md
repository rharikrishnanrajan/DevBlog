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

- **Frontend**: AngularJS (1.8.x), HTML5, CSS3, JavaScript (SPA with Hash-Bang Routing).
- **Backend**: Node.js, Express.js (v4.21.2), TypeScript (v5.7.2), REST API (`mysql2/promise`, `cors`, `dotenv`).
- **Database**: Aiven MySQL 8.x (`blog` database, `posts` table).
- **Hosting / Deployment**:
   - Frontend: **Vercel**
   - Backend: **Render** (or Railway / Heroku / VPS)
   - Database: **Aiven Cloud MySQL**

---

## 3. Architecture & Project Structure

```text
┌──────────────────────┐
                   │     Vercel Hosting     │
                   │      AngularJS       │
                   │   Frontend (SPA)     │
                   └──────────┬───────────┘
                              │
                              │ REST API (JSON / CORS)
                              ▼
                   ┌──────────────────────┐
                   │ Express + TypeScript │
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

│
├── database/
│   └── schema.sql              # MySQL table schema
│
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express application entry point (TypeScript)
│   │   ├── config/
│   │   │   └── database.ts     # MySQL connection pool with SSL
│   │   ├── controllers/
│   │   │   └── postController.ts # CRUD controllers with validation & types
│   │   ├── routes/
│   │   │   └── postRoutes.ts   # REST endpoint route definitions
│   │   └── types/
│   │       └── post.ts         # TypeScript interfaces (BlogPost, CreatePostInput)
│   ├── dist/                   # Compiled JavaScript output
│   ├── tsconfig.json           # TypeScript configuration
│   ├── package.json            # Dependencies, scripts (dev, build, start)
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Ignores .env, node_modules, and dist
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

# Optional CORS origin (e.g. your Vercel domain)
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

## 9. Deploying Frontend and Backend Together (Recommended)

You can deploy the entire application (Frontend + Backend + REST API) as a single unified service. This eliminates CORS configuration, eliminates the need for separate hosting services, and provides a single live URL for your entire blog platform.

### Option A: 1-Click Deployment on Render Blueprint (Free)
1. Push this repository to GitHub.
2. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and click **New +** → **Blueprint**.
3. Select your repository. Render reads `render.yaml` and auto-configures the fullstack service.
4. *(Optional)* Add your MySQL credentials in the Render dashboard under the **Environment** tab if using Aiven MySQL. If omitted, the app will run with resilient fallback in-memory storage.
5. Click **Apply**. Render will build and deploy your unified blog application!

### Option B: Deploy with Docker / Railway / Fly.io / VPS
You can build and run the multi-stage Docker container anywhere:

```bash
# Build Docker image
docker build -t developer-blog .

# Run container on port 5000
docker run -p 5000:5000 \
  -e DB_HOST=your-mysql-host \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=yourpassword \
  -e DB_NAME=blog \
  developer-blog
```

Or run locally with Docker Compose:
```bash
docker compose up -d
```

### Option C: Standalone Local Run (Frontend + Backend together)
```bash
# 1. Install dependencies
npm --prefix backend install

# 2. Build TypeScript
npm --prefix backend run build

# 3. Start unified server
npm --prefix backend start
```
Open **`http://localhost:5000`** in your browser to access both the blog UI and REST API.

---

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
