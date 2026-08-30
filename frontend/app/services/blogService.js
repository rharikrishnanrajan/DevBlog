// BlogService: Centralized REST API Service with resilient client-side storage fallback
app.factory('BlogService', ['$http', '$q', 'API_CONFIG', function($http, $q, API_CONFIG) {
    var service = {};
    var baseUrl = API_CONFIG.BASE_URL;
    var STORAGE_KEY = 'developer_blog_posts';
    var SEEDED_KEY = 'developer_blog_seeded'; // tracks if localStorage has legacy fake data

    // On first load, clear out any stale seeded demo data from previous versions
    // so the real backend data is always shown when available.
    (function clearLegacySeed() {
        try {
            if (!localStorage.getItem(SEEDED_KEY)) {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.setItem(SEEDED_KEY, '1');
            }
        } catch(e) {}
    })();

    function getLocalPosts() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            return JSON.parse(data) || [];
        } catch (e) {
            return [];
        }
    }

    function saveLocalPosts(posts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    }

    // Fetch all published blog posts
    service.getAll = function() {
        return $http.get(baseUrl + '/posts')
            .then(function(response) {
                // Backend succeeded — sync localStorage with the real data
                saveLocalPosts(response.data || []);
                return response;
            })
            .catch(function(err) {
                console.warn('Backend unavailable, using local storage:', err);
                var posts = getLocalPosts();
                return { data: posts };
            });
    };

    // Fetch a single blog post by its numeric ID
    service.getById = function(id) {
        return $http.get(baseUrl + '/posts/' + id)
            .catch(function(err) {
                console.warn('Backend unavailable, reading from local storage:', err);
                var posts = getLocalPosts();
                var post = posts.find(function(p) { return p.id == id; });
                if (post) {
                    return { data: post };
                }
                return $q.reject(err);
            });
    };

    // Create and publish a new blog post
    service.create = function(postData) {
        return $http.post(baseUrl + '/posts', postData)
            .catch(function(err) {
                console.warn('Backend unavailable, saving post to local storage:', err);
                var posts = getLocalPosts();
                var newId = posts.length > 0 ? Math.max.apply(Math, posts.map(function(p) { return p.id; })) + 1 : 1;
                var newPost = {
                    id: newId,
                    title: postData.title,
                    content: postData.content,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                posts.unshift(newPost);
                saveLocalPosts(posts);
                return { data: { message: 'Blog created successfully', id: newId } };
            });
    };

    // Update an existing blog post
    service.update = function(id, postData) {
        return $http.put(baseUrl + '/posts/' + id, postData)
            .catch(function(err) {
                console.warn('Backend unavailable, updating post in local storage:', err);
                var posts = getLocalPosts();
                var index = posts.findIndex(function(p) { return p.id == id; });
                if (index !== -1) {
                    posts[index].title = postData.title;
                    posts[index].content = postData.content;
                    posts[index].updated_at = new Date().toISOString();
                    saveLocalPosts(posts);
                    return { data: { message: 'Blog updated successfully' } };
                }
                return $q.reject(err);
            });
    };

    // Delete a blog post by ID
    service.delete = function(id) {
        return $http.delete(baseUrl + '/posts/' + id)
            .catch(function(err) {
                console.warn('Backend unavailable, deleting post from local storage:', err);
                var posts = getLocalPosts();
                var filtered = posts.filter(function(p) { return p.id != id; });
                saveLocalPosts(filtered);
                return { data: { message: 'Blog deleted successfully' } };
            });
    };

    return service;
}]);
