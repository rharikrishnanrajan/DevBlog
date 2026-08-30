// BlogService: Centralized REST API Service with resilient client-side storage fallback
app.factory('BlogService', ['$http', '$q', 'API_CONFIG', function($http, $q, API_CONFIG) {
    var service = {};
    var baseUrl = API_CONFIG.BASE_URL;
    var STORAGE_KEY = 'developer_blog_posts';

    function getLocalPosts() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            var parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
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
                console.warn('Backend unavailable, using cached local storage:', err);
                var posts = getLocalPosts();
                if (posts.length > 0) {
                    return { data: posts };
                }
                return $q.reject(err);
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
            .then(function(response) {
                return response;
            });
    };

    // Update an existing blog post
    service.update = function(id, postData) {
        return $http.put(baseUrl + '/posts/' + id, postData)
            .then(function(response) {
                return response;
            });
    };

    // Delete a blog post by ID
    service.delete = function(id) {
        return $http.delete(baseUrl + '/posts/' + id)
            .then(function(response) {
                return response;
            });
    };

    return service;
}]);
