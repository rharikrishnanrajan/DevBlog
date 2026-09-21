<?php
/**
 * System & Database Health Check Endpoint
 * DevBlog Platform
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

$response = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'php_version' => PHP_VERSION,
    'database' => [
        'connected' => false,
        'driver' => 'mysql',
        'table_count' => 0,
        'posts_count' => 0,
        'error' => null
    ]
];

try {
    $pdo = Database::getConnection();
    $response['database']['connected'] = true;

    $stmt = $pdo->query('SELECT COUNT(*) AS total FROM posts');
    $row = $stmt->fetch();
    $response['database']['posts_count'] = (int)($row['total'] ?? 0);

} catch (Throwable $e) {
    $response['status'] = 'degraded';
    $response['database']['error'] = $e->getMessage();
}

http_response_code($response['database']['connected'] ? 200 : 503);
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
