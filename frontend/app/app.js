// Initialize the AngularJS Blog Application module
var app = angular.module('blogApp', ['ngRoute', 'ngSanitize']);

// Central API Configuration
// When deployed unified (frontend + backend served together): uses relative '/api'
// When injected via GitHub Actions or global variable: uses window.__API_URL__
// Fallback for standalone file:// protocol: 'http://localhost:5000/api'
app.constant('API_CONFIG', {
    BASE_URL: (function() {
        if (window.__API_URL__ && window.__API_URL__ !== '__INJECT_API_URL__' && window.__API_URL__.trim() !== '') {
            return window.__API_URL__;
        }
        if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
            return '/api';
        }
        return 'http://localhost:5000/api';
    })()
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
