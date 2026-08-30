// BlogController: Handles public viewing of blog list and single blog details
app.controller('BlogController', ['$scope', '$routeParams', 'BlogService', '$location', function($scope, $routeParams, BlogService, $location) {
    $scope.posts = [];
    $scope.post = null;
    $scope.loading = true;
    $scope.error = null;

    // Helper to format ISO/MySQL timestamp into human-readable format (e.g. "August 30, 2026")
    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        var date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper to extract a short preview snippet from blog content
    $scope.getSnippet = function(content, maxLength) {
        if (!content) return '';
        maxLength = maxLength || 160;
        var clean = content.trim();
        if (clean.length <= maxLength) return clean;
        return clean.substring(0, maxLength).trim() + '...';
    };

    // Helper to calculate estimated read time
    $scope.getReadTime = function(content) {
        if (!content) return '1 min read';
        var words = content.trim().split(/\s+/).length;
        var minutes = Math.ceil(words / 200);
        return minutes + ' min read';
    };

    // Initialization logic
    if ($routeParams.id) {
        // Detailed single blog view
        var postId = $routeParams.id;
        BlogService.getById(postId)
            .then(function(response) {
                $scope.post = response.data;
                $scope.loading = false;
            })
            .catch(function(err) {
                $scope.loading = false;
                $scope.error = (err.data && err.data.message) ? err.data.message : 'Failed to load blog post. It may not exist.';
            });
    } else {
        // Home view: fetch all blogs
        BlogService.getAll()
            .then(function(response) {
                $scope.posts = response.data || [];
                $scope.loading = false;
            })
            .catch(function(err) {
                $scope.loading = false;
                $scope.error = 'Unable to connect to the backend server. Please verify the API is running.';
            });
    }

    // Delete blog post
    $scope.deleteBlog = function(post) {
        var confirmed = window.confirm('Are you sure you want to delete "' + post.title + '"? This action cannot be undone.');
        if (!confirmed) return;

        BlogService.delete(post.id)
            .then(function(response) {
                // Redirect to homepage after successful deletion
                $location.path('/');
            })
            .catch(function(err) {
                $scope.error = (err.data && err.data.message) ? err.data.message : 'Failed to delete blog.';
            });
    };
}]);
