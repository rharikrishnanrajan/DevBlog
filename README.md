# DevBlog - Developer Personal Blog Platform

A developer-centric personal blogging platform built with **HTML5, CSS3, Vanilla JavaScript (ES6+), PHP 8.x, and MySQL**.

---

## ⚡ Tech Stack

- **Frontend**: Native HTML5, Modern CSS3 (Dark Developer Theme, Glassmorphism, Fira Code & Inter typography), Vanilla JavaScript (ES6+), Marked.js (Markdown parsing), Highlight.js (Code syntax highlighting).
- **Backend**: Native PHP 8.x, RESTful JSON API with PDO prepared statements.
- **Database**: Local MySQL 8.x (`database: blog`, `user: root`, `password: Hari@2906`).

---

## 🚀 Features

- **Markdown Native**: Write and preview articles formatted with headings, code blocks, lists, blockquotes, and tables.
- **Code Syntax Highlighting**: Automatic syntax highlighting for PHP, JavaScript, Python, SQL, HTML, CSS, and more.
- **Real-time Live Search**: Instant client-side and server-side article filtering by title or content keywords.
- **Interactive Markdown Editor**: Split Live Preview tab with quick-formatting toolbar buttons.
- **Full CRUD Support**: Create, read, update, and safely delete blog posts with confirmation modals.
- **Responsive Terminal Design**: Optimized for mobile, tablet, and desktop screens with sticky navigation and collapsible mobile menu.
- **RESTful API**: Clean JSON endpoints for headless consumption and decoupled architectures.

---

## 📂 Project Architecture

```
DevBlog/
├── config/
│   └── database.php        # PDO Database singleton & connection handler (MySQL localhost)
├── api/
│   ├── posts.php           # RESTful JSON CRUD API (GET, POST, PUT, DELETE)
│   └── health.php          # Database connectivity health check endpoint
├── assets/
│   ├── css/
│   │   └── style.css       # Dark developer theme stylesheet
│   ├── js/
│   │   └── app.js          # Client-side controller (search, markdown preview, modals, AJAX)
│   └── images/
│       └── logo.jpg        # DevBlog branding logo
├── database/
│   └── schema.sql          # MySQL database initialization script & seed articles
├── views/
│   ├── header.php          # Global header component (navigation, fonts, assets)
│   └── footer.php          # Global footer component (scripts, delete modal, toasts)
├── index.php               # Homepage listing all blog posts with search
├── post.php                # Single article detail view with rendered Markdown & code highlighting
├── create.php              # Create new article page with live Markdown preview
├── edit.php                # Edit existing article page
├── router.php              # Built-in PHP CLI development server router
├── .htaccess               # Apache / XAMPP URL rewriting & security headers
└── README.md               # Project documentation
```

---

## 🛠️ Quick Start & Local Setup

### 1. Initialize the MySQL Database

Run the provided SQL migration in your MySQL client:

```bash
mysql -u root -pHari@2906 < database/schema.sql
```

Alternatively, open MySQL Workbench / phpMyAdmin, create database `blog`, and execute the statements in [`database/schema.sql`](database/schema.sql).

### 2. Start the Application

#### Option A: PHP Built-in Server (Recommended for instant testing)
Run the following command in the project root folder:

```bash
php -S localhost:8000 router.php
```
Open your browser and visit: **[http://localhost:8000](http://localhost:8000)**

#### Option B: XAMPP / WAMP / Laragon
1. Place or link the `DevBlog` folder into your web root (e.g. `C:/xampp/htdocs/DevBlog`).
2. Start Apache and MySQL from your XAMPP Control Panel.
3. Open your browser and navigate to: **[http://localhost/DevBlog/](http://localhost/DevBlog/)**

---

## 📡 API Reference

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts.php` | List all posts | Optional query `?q=search_term` |
| `GET` | `/api/posts.php?id={id}` | Get single post by ID | N/A |
| `POST` | `/api/posts.php` | Create a new post | `{"title": "...", "content": "..."}` |
| `PUT` | `/api/posts.php?id={id}` | Update post | `{"title": "...", "content": "..."}` |
| `DELETE` | `/api/posts.php?id={id}` | Delete post | N/A |
| `GET` | `/api/health.php` | Database health check | N/A |

---

## 🔒 Security Highlights

- **PDO Prepared Statements**: All queries strictly use parameterized queries to prevent SQL injection.
- **Output Sanitization**: All dynamic HTML outputs are sanitized with `htmlspecialchars()` to prevent XSS attacks.
- **RESTful Validation**: Payload inputs (title, content, ID) undergo strict validation and boundary checks before database mutations.
