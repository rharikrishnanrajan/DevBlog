# Backend - Developer-Centric Personal Blog Platform

TypeScript (v5.7.2) REST API backend built with Express (v4.21.2) and MySQL (Aiven MySQL compatible).

## Prerequisites

- Node.js (v18+)
- MySQL 8.x or Aiven MySQL instance

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```bash
   cp .env.example .env
   ```
   Example `.env`:
   ```env
   PORT=5000
   DB_HOST=your-aiven-mysql-host.aivencloud.com
   DB_PORT=27008
   DB_USER=avnadmin
   DB_PASSWORD=your_password
   DB_NAME=blog
   ```

3. Build and Start the server:
   ```bash
   # Development with auto-reload (TSX)
   npm run dev

   # Build TypeScript to dist/
   npm run build

   # Production mode (runs compiled JS)
   npm start
   ```

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | List all blogs (ordered by latest) |
| `GET` | `/api/posts/:id` | Get details for one blog |
| `POST` | `/api/posts` | Create a new blog (`{ "title": "...", "content": "..." }`) |
| `PUT` | `/api/posts/:id` | Update an existing blog (`{ "title": "...", "content": "..." }`) |
| `DELETE`| `/api/posts/:id` | Delete a blog post |
| `GET` | `/api/health` | API Health & status check |
