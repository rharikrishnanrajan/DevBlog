# Frontend - Developer-Centric Personal Blog Platform

Lightweight AngularJS Single-Page Application designed for deployment to static hosts (e.g., Vercel).

## Technology Stack

- AngularJS 1.8.x
- `ngRoute` (Hash-bang `#!/` routing for SPA reload compatibility)
- `ngSanitize`
- HTML5 & CSS3 (Developer-centric typography & responsive layout)

## Project Structure

```text
frontend/
│
├── index.html                  # Main SPA entry point
├── package.json                # Local runner configuration
├── README.md                   # Frontend documentation
│
└── app/
    ├── app.js                  # Module, routes & API URL config
    │
    ├── controllers/
    │   ├── blogController.js   # Blog listing & single post view
    │   └── adminController.js  # Create, edit, and delete management
    │
    ├── services/
    │   └── blogService.js      # REST API client ($http)
    │
    ├── views/
    │   ├── home.html           # Homepage blog stream
    │   ├── blog-detail.html    # Full blog post view
    │   ├── create-blog.html    # Blog authoring & management
    │   └── edit-blog.html      # Blog modification
    │
    └── styles/
        └── style.css           # Developer dark theme stylesheet
```

## Running Locally

You can serve the frontend using any static file server or Node:

```bash
# Option 1: Using npx serve
npx serve .

# Option 2: Using python
python -m http.server 8080
```

Open `http://localhost:3000` (or `http://localhost:8080`) in your browser.

## Connecting to Backend

In `app/app.js`:

```javascript
app.constant('API_CONFIG', {
    BASE_URL: 'http://localhost:5000/api' // Local backend
    // Or for production:
    // BASE_URL: 'https://your-backend.onrender.com/api'
});
```


