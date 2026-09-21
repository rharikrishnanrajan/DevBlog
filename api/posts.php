<?php
/**
 * RESTful Blog Posts API
 * DevBlog Platform
 * 
 * Endpoints:
 * - GET    /api/posts.php             : Get all posts (or ?q=search_term)
 * - GET    /api/posts.php?id={id}     : Get single post by ID
 * - POST   /api/posts.php             : Create a new post
 * - PUT    /api/posts.php?id={id}     : Update an existing post
 * - DELETE /api/posts.php?id={id}     : Delete a post
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = Database::getConnection();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper to send JSON response and terminate
function sendResponse(int $statusCode, array $data): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Helper to validate and parse integer ID
function parsePostId(?string $id): ?int {
    if ($id === null || !ctype_digit(trim($id))) {
        return null;
    }
    $val = (int)$id;
    return ($val > 0 && $val <= 2147483647) ? $val : null;
}

// Read JSON input payload for POST / PUT
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

// Route request based on HTTP method
switch ($method) {
    case 'GET':
        // Check if fetching single post by ID
        $idParam = $_GET['id'] ?? null;
        if ($idParam !== null) {
            $postId = parsePostId((string)$idParam);
            if ($postId === null) {
                sendResponse(400, [
                    'success' => false,
                    'message' => 'Invalid post ID. Must be a positive integer.'
                ]);
            }

            $stmt = $pdo->prepare('SELECT id, title, content, created_at, updated_at FROM posts WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $postId]);
            $post = $stmt->fetch();

            if (!$post) {
                sendResponse(404, [
                    'success' => false,
                    'message' => 'Blog post not found.'
                ]);
            }

            sendResponse(200, [
                'success' => true,
                'data' => $post
            ]);
        }

        // Fetch multiple posts (optional search query ?q=...)
        $searchQuery = trim($_GET['q'] ?? '');
        if ($searchQuery !== '') {
            $stmt = $pdo->prepare('
                SELECT id, title, content, created_at, updated_at 
                FROM posts 
                WHERE title LIKE :q1 OR content LIKE :q2 
                ORDER BY created_at DESC
            ');
            $term = '%' . $searchQuery . '%';
            $stmt->execute([':q1' => $term, ':q2' => $term]);
        } else {
            $stmt = $pdo->query('
                SELECT id, title, content, created_at, updated_at 
                FROM posts 
                ORDER BY created_at DESC
            ');
        }

        $posts = $stmt->fetchAll();
        sendResponse(200, [
            'success' => true,
            'count' => count($posts),
            'data' => $posts
        ]);
        break;

    case 'POST':
        $data = getJsonInput();
        $title = trim((string)($data['title'] ?? $_POST['title'] ?? ''));
        $content = trim((string)($data['content'] ?? $_POST['content'] ?? ''));

        // Validation
        if ($title === '') {
            sendResponse(400, ['success' => false, 'message' => 'Post title is required.']);
        }
        if (mb_strlen($title) > 255) {
            sendResponse(400, ['success' => false, 'message' => 'Post title must not exceed 255 characters.']);
        }
        if ($content === '') {
            sendResponse(400, ['success' => false, 'message' => 'Post content is required.']);
        }
        if (mb_strlen($content) > 16777215) { // MEDIUMTEXT limit
            sendResponse(400, ['success' => false, 'message' => 'Post content exceeds maximum allowed size.']);
        }

        $stmt = $pdo->prepare('INSERT INTO posts (title, content, created_at, updated_at) VALUES (:title, :content, NOW(), NOW())');
        $stmt->execute([
            ':title' => $title,
            ':content' => $content
        ]);
        $newId = (int)$pdo->lastInsertId();

        sendResponse(201, [
            'success' => true,
            'message' => 'Blog post created successfully.',
            'id' => $newId
        ]);
        break;

    case 'PUT':
    case 'PATCH':
        $idParam = $_GET['id'] ?? null;
        $postId = parsePostId($idParam ? (string)$idParam : null);
        if ($postId === null) {
            sendResponse(400, ['success' => false, 'message' => 'A valid post ID is required for updates.']);
        }

        $data = getJsonInput();
        $title = trim((string)($data['title'] ?? ''));
        $content = trim((string)($data['content'] ?? ''));

        // Validation
        if ($title === '') {
            sendResponse(400, ['success' => false, 'message' => 'Post title is required.']);
        }
        if (mb_strlen($title) > 255) {
            sendResponse(400, ['success' => false, 'message' => 'Post title must not exceed 255 characters.']);
        }
        if ($content === '') {
            sendResponse(400, ['success' => false, 'message' => 'Post content is required.']);
        }

        // Check if post exists
        $checkStmt = $pdo->prepare('SELECT id FROM posts WHERE id = :id LIMIT 1');
        $checkStmt->execute([':id' => $postId]);
        if (!$checkStmt->fetch()) {
            sendResponse(404, ['success' => false, 'message' => 'Blog post not found.']);
        }

        $updateStmt = $pdo->prepare('UPDATE posts SET title = :title, content = :content, updated_at = NOW() WHERE id = :id');
        $updateStmt->execute([
            ':title' => $title,
            ':content' => $content,
            ':id' => $postId
        ]);

        sendResponse(200, [
            'success' => true,
            'message' => 'Blog post updated successfully.',
            'id' => $postId
        ]);
        break;

    case 'DELETE':
        $idParam = $_GET['id'] ?? null;
        $postId = parsePostId($idParam ? (string)$idParam : null);
        if ($postId === null) {
            sendResponse(400, ['success' => false, 'message' => 'A valid post ID is required for deletion.']);
        }

        $checkStmt = $pdo->prepare('SELECT id FROM posts WHERE id = :id LIMIT 1');
        $checkStmt->execute([':id' => $postId]);
        if (!$checkStmt->fetch()) {
            sendResponse(404, ['success' => false, 'message' => 'Blog post not found.']);
        }

        $deleteStmt = $pdo->prepare('DELETE FROM posts WHERE id = :id');
        $deleteStmt->execute([':id' => $postId]);

        sendResponse(200, [
            'success' => true,
            'message' => 'Blog post deleted successfully.',
            'id' => $postId
        ]);
        break;

    default:
        sendResponse(405, [
            'success' => false,
            'message' => "HTTP method {$method} is not supported."
        ]);
        break;
}
