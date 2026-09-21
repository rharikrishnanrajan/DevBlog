<?php
/**
 * Built-in PHP CLI Web Server Router
 * 
 * Usage:
 *   php -S localhost:8000 router.php
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$filePath = __DIR__ . $uri;

// If request is for an existing static file or directory, serve it directly
if ($uri !== '/' && file_exists($filePath)) {
    // Let the PHP built-in server handle static files directly (CSS, JS, images, etc.)
    if (!is_dir($filePath)) {
        return false;
    }
}

// Route API requests directly
if (str_starts_with($uri, '/api/')) {
    $script = __DIR__ . $uri;
    if (file_exists($script)) {
        require $script;
        return true;
    }
}

// Default index routing
if ($uri === '/' || $uri === '/index') {
    require __DIR__ . '/index.php';
    return true;
}

// Fallback to directly named PHP file if exists (e.g. /create -> create.php)
if (file_exists(__DIR__ . $uri . '.php')) {
    require __DIR__ . $uri . '.php';
    return true;
}

// Otherwise pass to PHP built-in server
return false;
