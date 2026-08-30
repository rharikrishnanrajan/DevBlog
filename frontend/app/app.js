// Initialize the AngularJS Blog Application module
var app = angular.module('blogApp', ['ngRoute', 'ngSanitize']);

// Central API Configuration
// Resolves the backend REST API endpoint across environments:
// 1. Build-time injected URL: window.__API_URL__
// 2. User dynamic setting: localStorage.getItem('devblog_api_url')
// 3. Local Development: 'http://localhost:5000/api'
// 4. Unified Full-Stack Cloud Host (Render/Railway): '/api'
// 5. File Protocol: Fallback to resilient client-side storage (for direct file access)
//    For static hosts (Vercel, Netlify, etc.), API_URL must be configured via build-time injection or localStorage
app.constant('API_CONFIG', {
    BASE_URL: (function() {
        // 1. Check build-time injected API_URL
        if (window.__API_URL__ && 
            window.__API_URL__ !== '__INJECT_API_URL__' && 
            window.__API_URL__.trim() !== '' && 
            !window.__API_URL__.includes('${{')) {
            var url = window.__API_URL__.trim().replace(/\/+$/, '');
            return url.endsWith('/api') ? url : url + '/api';
        }

        // 2. Check user dynamic override from localStorage
        try {
            var customApi = localStorage.getItem('devblog_api_url');
            if (customApi && customApi.trim() !== '') {
                var cUrl = customApi.trim().replace(/\/+$/, '');
                return cUrl.endsWith('/api') ? cUrl : cUrl + '/api';
            }
        } catch (e) {}

        // 3. Environment detection via window.location
        if (typeof window !== 'undefined' && window.location) {
            var hostname = window.location.hostname;
            var port = window.location.port;

            // Local development
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                if (port === '5000') {
                    return '/api';
                }
                return 'http://localhost:5000/api';
            }

            // File protocol (no backend available)
            if (window.location.protocol === 'file:') {
                return ''; // Triggers offline/client-side storage mode
            }

            // Hosted unified full-stack web service (e.g. Render, Railway, VPS)
            if (window.location.protocol && window.location.protocol.startsWith('http')) {
                return '/api';
            }
        }

        return 'http://localhost:5000/api';
    })()
});

// Configure client-side routing
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
        // Admin: Create a new blog (and manage existing)
        .when('/admin/create', {
            templateUrl: 'app/views/create-blog.html',
            controller: 'AdminController'
        })
        // Admin: Edit an existing blog
        .when('/admin/edit/:id', {
            templateUrl: 'app/views/edit-blog.html',
            controller: 'AdminController'
        })
        // Fallback: Redirect unknown routes to home
        .otherwise({
            redirectTo: '/'
        });
}]);
