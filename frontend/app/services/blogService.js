// BlogService: Centralized Data Layer with seamless REST API sync & resilient storage
app.factory('BlogService', ['$http', '$q', 'API_CONFIG', function($http, $q, API_CONFIG) {
    var service = {};
    var baseUrl = API_CONFIG.BASE_URL;
    var STORAGE_KEY = 'developer_blog_posts';

    // Default starter posts for first-time visitors / static demo mode
    var DEFAULT_POSTS = [
        {
            id: 1,
            title: 'Mastering Modern Full-Stack Development with TypeScript & MySQL',
            content: 'Building production-grade web applications requires a robust architecture, secure REST APIs, and a streamlined database layer.\n\n### Core Pillars:\n- **Type Safety**: Using TypeScript on both backend and tooling.\n- **Data Integrity**: Leveraging relational schemas with MySQL connection pooling and SSL encryption.\n- **Resilience**: Implementing in-memory or client storage fallbacks when services restart.\n\n```typescript\nimport express from "express";\nconst app = express();\napp.get("/api/health", (req, res) => res.json({ status: "ok" }));\n```\n\nHappy coding!',
            created_at: '2026-08-30T10:00:00.000Z',
            updated_at: '2026-08-30T10:00:00.000Z'
        },
        {
            id: 2,
            title: 'Designing Sleek Developer Portfolios & Dark Mode UI',
            content: 'Developer experiences should be clean, fast, and visually striking. Using curated HSL palettes, CSS variables, and modern monospace typography turns a standard blog into an impressive platform.\n\n```css\n:root {\n  --bg-main: #0f141c;\n  --accent-blue: #38bdf8;\n  --font-mono: "Fira Code", monospace;\n}\n```\n\nSimplicity and attention to detail make all the difference.',
            created_at: '2026-08-29T14:30:00.000Z',
            updated_at: '2026-08-29T14:30:00.000Z'
        }
    ];

    function getLocalPosts() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                saveLocalPosts(DEFAULT_POSTS);
                return DEFAULT_POSTS.slice();
            }
            var parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
            saveLocalPosts(DEFAULT_POSTS);
            return DEFAULT_POSTS.slice();
        } catch (e) {
            return DEFAULT_POSTS.slice();
        }
    }

    function saveLocalPosts(posts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    // Check if backend API URL is defined
    service.hasBackend = function() {
        return !!(baseUrl && baseUrl.trim() !== '');
    };

    service.getBaseUrl = function() {
        return baseUrl;
    };

    // Fetch all published blog posts
    service.getAll = function() {
        if (!service.hasBackend()) {
            return $q.resolve({ data: getLocalPosts(), source: 'local' });
        }

        return $http.get(baseUrl + '/posts', { timeout: 8000 })
            .then(function(response) {
                var serverPosts = response.data || [];
                if (Array.isArray(serverPosts)) {
                    saveLocalPosts(serverPosts);
                }
                return { data: serverPosts, source: 'backend' };
            })
            .catch(function(err) {
                console.warn('Backend unavailable, falling back to cached local storage:', err);
                var localPosts = getLocalPosts();
                return { data: localPosts, source: 'local_fallback' };
            });
    };

    // Fetch a single blog post by its ID
    service.getById = function(id) {
        if (!service.hasBackend()) {
            var posts = getLocalPosts();
            var post = posts.find(function(p) { return String(p.id) === String(id); });
            if (post) return $q.resolve({ data: post, source: 'local' });
            return $q.reject({ data: { message: 'Blog post not found in local storage.' } });
        }

        return $http.get(baseUrl + '/posts/' + id, { timeout: 8000 })
            .then(function(response) {
                return { data: response.data, source: 'backend' };
            })
            .catch(function(err) {
                console.warn('Backend unavailable, reading from local storage:', err);
                var posts = getLocalPosts();
                var post = posts.find(function(p) { return String(p.id) === String(id); });
                if (post) {
                    return { data: post, source: 'local_fallback' };
                }
                return $q.reject(err);
            });
    };

    // Create and publish a new blog post
    service.create = function(postData) {
        if (!service.hasBackend()) {
            var posts = getLocalPosts();
            var newId = posts.length > 0 ? Math.max.apply(null, posts.map(function(p) { return p.id || 0; })) + 1 : 1;
            var newPost = {
                id: newId,
                title: postData.title,
                content: postData.content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            posts.unshift(newPost);
            saveLocalPosts(posts);
            return $q.resolve({ data: newPost, source: 'local' });
        }

        return $http.post(baseUrl + '/posts', postData)
            .then(function(response) {
                var created = response.data;
                var posts = getLocalPosts();
                posts.unshift(created);
                saveLocalPosts(posts);
                return response;
            })
            .catch(function(err) {
                console.warn('Backend write failed, saving locally:', err);
                var posts = getLocalPosts();
                var newId = Date.now();
                var newPost = {
                    id: newId,
                    title: postData.title,
                    content: postData.content,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                posts.unshift(newPost);
                saveLocalPosts(posts);
                return { data: newPost, source: 'local_fallback' };
            });
    };

    // Update an existing blog post
    service.update = function(id, postData) {
        if (!service.hasBackend()) {
            var posts = getLocalPosts();
            var index = posts.findIndex(function(p) { return String(p.id) === String(id); });
            if (index !== -1) {
                posts[index].title = postData.title;
                posts[index].content = postData.content;
                posts[index].updated_at = new Date().toISOString();
                saveLocalPosts(posts);
                return $q.resolve({ data: posts[index], source: 'local' });
            }
            return $q.reject({ data: { message: 'Blog post not found to update.' } });
        }

        return $http.put(baseUrl + '/posts/' + id, postData)
            .then(function(response) {
                var updated = response.data;
                var posts = getLocalPosts();
                var index = posts.findIndex(function(p) { return String(p.id) === String(id); });
                if (index !== -1) {
                    posts[index] = updated;
                    saveLocalPosts(posts);
                }
                return response;
            })
            .catch(function(err) {
                console.warn('Backend update failed, updating locally:', err);
                var posts = getLocalPosts();
                var index = posts.findIndex(function(p) { return String(p.id) === String(id); });
                if (index !== -1) {
                    posts[index].title = postData.title;
                    posts[index].content = postData.content;
                    posts[index].updated_at = new Date().toISOString();
                    saveLocalPosts(posts);
                    return { data: posts[index], source: 'local_fallback' };
                }
                return $q.reject(err);
            });
    };

    // Delete a blog post by ID
    service.delete = function(id) {
        if (!service.hasBackend()) {
            var posts = getLocalPosts();
            var filtered = posts.filter(function(p) { return String(p.id) !== String(id); });
            saveLocalPosts(filtered);
            return $q.resolve({ data: { message: 'Deleted locally' }, source: 'local' });
        }

        return $http.delete(baseUrl + '/posts/' + id)
            .then(function(response) {
                var posts = getLocalPosts();
                var filtered = posts.filter(function(p) { return String(p.id) !== String(id); });
                saveLocalPosts(filtered);
                return response;
            })
            .catch(function(err) {
                console.warn('Backend delete failed, deleting locally:', err);
                var posts = getLocalPosts();
                var filtered = posts.filter(function(p) { return String(p.id) !== String(id); });
                saveLocalPosts(filtered);
                return { data: { message: 'Deleted locally (fallback)' }, source: 'local_fallback' };
            });
    };

    return service;
}]);
