// AdminController: Handles blog authoring, updating, and deletion management
app.controller('AdminController', ['$scope', '$routeParams', '$location', '$timeout', 'BlogService', function($scope, $routeParams, $location, $timeout, BlogService) {
    $scope.post = {
        title: '',
        content: ''
    };
    $scope.existingPosts = [];
    $scope.loading = false;
    $scope.submitting = false;
    $scope.alert = null; // { type: 'success' | 'error', message: '...' }

    // Helper to format date in admin post list
    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        var date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Load existing posts for management list on create page
    $scope.loadExistingPosts = function() {
        BlogService.getAll()
            .then(function(response) {
                $scope.existingPosts = response.data || [];
            })
            .catch(function(err) {
                console.warn('Could not load existing posts for admin table:', err);
            });
    };

    // If on edit page, fetch the post by ID
    if ($routeParams.id) {
        $scope.loading = true;
        var editId = $routeParams.id;
        BlogService.getById(editId)
            .then(function(response) {
                $scope.post = {
                    title: response.data.title,
                    content: response.data.content
                };
                $scope.loading = false;
            })
            .catch(function(err) {
                $scope.loading = false;
                $scope.alert = {
                    type: 'error',
                    message: (err.data && err.data.message) ? err.data.message : 'Blog not found.'
                };
            });
    } else {
        // We are on /admin/create - load current posts list for management
        $scope.loadExistingPosts();
    }

    // Publish a new blog post
    $scope.publishBlog = function() {
        if (!$scope.post.title || !$scope.post.title.trim()) {
            $scope.alert = { type: 'error', message: 'Please provide a blog title.' };
            return;
        }

        if (!$scope.post.content || !$scope.post.content.trim()) {
            $scope.alert = { type: 'error', message: 'Please provide blog content.' };
            return;
        }

        $scope.submitting = true;
        $scope.alert = null;

        BlogService.create({
            title: $scope.post.title.trim(),
            content: $scope.post.content.trim()
        })
        .then(function(response) {
            $scope.submitting = false;
            $scope.alert = {
                type: 'success',
                message: 'Blog published successfully! Redirecting...'
            };

            // Redirect to the newly created blog post or blog list after a short delay
            $timeout(function() {
                if (response.data && response.data.id) {
                    $location.path('/blog/' + response.data.id);
                } else {
                    $location.path('/');
                }
            }, 800);
        })
        .catch(function(err) {
            $scope.submitting = false;
            $scope.alert = {
                type: 'error',
                message: (err.data && err.data.message) ? err.data.message : 'Failed to publish blog. Please try again.'
            };
        });
    };

    // Update an existing blog post
    $scope.updateBlog = function() {
        if (!$scope.post.title || !$scope.post.title.trim()) {
            $scope.alert = { type: 'error', message: 'Please provide a blog title.' };
            return;
        }

        if (!$scope.post.content || !$scope.post.content.trim()) {
            $scope.alert = { type: 'error', message: 'Please provide blog content.' };
            return;
        }

        $scope.submitting = true;
        $scope.alert = null;
        var postId = $routeParams.id;

        BlogService.update(postId, {
            title: $scope.post.title.trim(),
            content: $scope.post.content.trim()
        })
        .then(function(response) {
            $scope.submitting = false;
            $scope.alert = {
                type: 'success',
                message: 'Blog updated successfully! Redirecting...'
            };

            $timeout(function() {
                $location.path('/blog/' + postId);
            }, 800);
        })
        .catch(function(err) {
            $scope.submitting = false;
            $scope.alert = {
                type: 'error',
                message: (err.data && err.data.message) ? err.data.message : 'Failed to update blog. Please try again.'
            };
        });
    };

    // Cancel edit and return
    $scope.cancelEdit = function() {
        if ($routeParams.id) {
            $location.path('/blog/' + $routeParams.id);
        } else {
            $location.path('/');
        }
    };

    // Delete a blog post with confirmation dialog
    $scope.deleteBlog = function(postToDelete) {
        var confirmed = window.confirm('Are you sure you want to delete "' + postToDelete.title + '"? This action cannot be undone.');
        if (!confirmed) return;

        BlogService.delete(postToDelete.id)
            .then(function(response) {
                $scope.alert = {
                    type: 'success',
                    message: 'Blog "' + postToDelete.title + '" deleted successfully.'
                };
                // Refresh management list
                $scope.loadExistingPosts();
            })
            .catch(function(err) {
                $scope.alert = {
                    type: 'error',
                    message: (err.data && err.data.message) ? err.data.message : 'Failed to delete blog.'
                };
            });
    };
}]);
