// Initialize the AngularJS Blog Application module
var app = angular.module('blogApp', ['ngRoute', 'ngSanitize']);

// Central API Configuration
// In production: window.__API_URL__ is injected by GitHub Actions (see .github/workflows/deploy.yml)
// In local dev:  falls back to http://localhost:5000/api automatically
app.constant('API_CONFIG', {
    BASE_URL: (window.__API_URL__ && window.__API_URL__ !== '__INJECT_API_URL__')
        ? window.__API_URL__
        : 'http://localhost:5000/api'
});

// Configure client-side routing
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // Configure hash-bang routing for seamless compatibility with GitHub Pages
    $locationProvider.hashPrefix('!');

    $routeProvider
        // Home: Blog list
        .when('/', {
            templateUrl: 'app/views/home.html',
            controller: 'BlogController'
        })
        // Blog Details: Read a specific blog
        .when('/blog/:id', {
            templateUrl: 'app/views/blog-detail.html',
            controller: 'BlogController'
        })
        // Admin: Create a new blog (also lists existing blogs for management)
        .when('/admin/create', {
            templateUrl: 'app/views/create-blog.html',
            controller: 'AdminController'
        })
        // Admin: Edit an existing blog
        .when('/admin/edit/:id', {
            templateUrl: 'app/views/edit-blog.html',
            controller: 'AdminController'
        })
        // Fallback: Redirect undefined routes to Home
        .otherwise({
            redirectTo: '/'
        });
}]);
