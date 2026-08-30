// BlogController: Handles public viewing of blog list and single blog details
app.controller('BlogController', ['$scope', '$routeParams', 'BlogService', '$location', '$sce', '$timeout', function($scope, $routeParams, BlogService, $location, $sce, $timeout) {
    $scope.posts = [];
    $scope.post = null;
    $scope.loading = true;
    $scope.error = null;
    $scope.linkCopied = false;

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

    // Helper to extract a short preview snippet from blog content (strips Markdown symbols)
    $scope.getSnippet = function(content, maxLength) {
        if (!content) return '';
        maxLength = maxLength || 160;
        // Strip markdown headings, links, bold, code blocks, images for clean snippet
        var clean = content
            .replace(/^#+\s+/gm, '') // headings
            .replace(/```[\s\S]*?```/g, '') // multiline code blocks
            .replace(/`([^`]+)`/g, '$1') // inline code
            .replace(/!\[.*?\]\(.*?\)/g, '') // images
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
            .replace(/(\*|_)(.*?)\1/g, '$2') // italic
            .replace(/>\s+/gm, '') // blockquotes
            .replace(/[-*+]\s+/gm, '') // lists
            .replace(/\n+/g, ' ') // collapse newlines
            .trim();

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

    // Render Markdown into safe, sanitized, highlighted HTML
    $scope.renderMarkdown = function(content) {
        if (!content) return '';
        if (typeof marked !== 'undefined') {
            try {
                // Configure marked options
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                    highlight: function(code, lang) {
                        if (typeof hljs !== 'undefined') {
                            if (lang && hljs.getLanguage(lang)) {
                                try {
                                    return hljs.highlight(code, { language: lang }).value;
                                } catch (e) {}
                            }
                            return hljs.highlightAuto(code).value;
                        }
                        return code;
                    }
                });
                var rawHtml = marked.parse(content);
                return $sce.trustAsHtml(rawHtml);
            } catch (err) {
                console.warn('Markdown parsing failed, rendering as text:', err);
            }
        }
        // Fallback: simple text preservation
        var escaped = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
        return $sce.trustAsHtml(escaped);
    };

    // Copy article link to clipboard with feedback
    $scope.copyLink = function() {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href).then(function() {
                $scope.$apply(function() {
                    $scope.linkCopied = true;
                    $timeout(function() {
                        $scope.linkCopied = false;
                    }, 2500);
                });
            }).catch(function() {
                $scope.fallbackCopy();
            });
        } else {
            $scope.fallbackCopy();
        }
    };

    $scope.fallbackCopy = function() {
        var dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        $scope.linkCopied = true;
        $timeout(function() {
            $scope.linkCopied = false;
        }, 2500);
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
