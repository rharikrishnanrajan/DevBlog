// BlogService: Centralized REST API Service for interacting with backend
app.factory('BlogService', ['$http', 'API_CONFIG', function($http, API_CONFIG) {
    var service = {};
    var baseUrl = API_CONFIG.BASE_URL;

    // Fetch all published blog posts
    service.getAll = function() {
        return $http.get(baseUrl + '/posts');
    };

    // Fetch a single blog post by its numeric ID
    service.getById = function(id) {
        return $http.get(baseUrl + '/posts/' + id);
    };

    // Create and publish a new blog post
    service.create = function(postData) {
        return $http.post(baseUrl + '/posts', postData);
    };

    // Update an existing blog post
    service.update = function(id, postData) {
        return $http.put(baseUrl + '/posts/' + id, postData);
    };

    // Delete a blog post by ID
    service.delete = function(id) {
        return $http.delete(baseUrl + '/posts/' + id);
    };

    return service;
}]);
