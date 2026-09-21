<?php
/**
 * DevBlog - Single Blog Post View
 */

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';

$postId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$post = null;
$error = null;

if (!$postId) {
    $error = 'Invalid blog post ID requested.';
} else {
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT id, title, content, created_at, updated_at FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $postId]);
        $post = $stmt->fetch();

        if (!$post) {
            $error = 'The requested blog post could not be found.';
        }
    } catch (Throwable $e) {
        $error = 'Database error: ' . $e->getMessage();
    }
}

$pageTitle = $post ? htmlspecialchars($post['title']) . ' - DevBlog' : 'Blog Post - DevBlog';
require_once __DIR__ . '/views/header.php';
?>

<div class="post-detail-container">
    <div class="post-detail-nav">
        <a href="index.php" class="back-link">
            &larr; Back to all posts
        </a>
        <?php if ($post): ?>
            <div class="post-card-actions">
                <button type="button" class="action-btn" id="btn-copy-link" title="Copy share link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    Share
                </button>
                <a href="edit.php?id=<?= (int)$post['id'] ?>" class="action-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    Edit
                </a>
                <button type="button" class="action-btn delete-btn" data-id="<?= (int)$post['id'] ?>">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        <?php endif; ?>
    </div>

    <?php if ($error || !$post): ?>
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h2 class="empty-title">Article Not Found</h2>
            <p class="empty-text"><?= htmlspecialchars($error ?? 'Post does not exist.', ENT_QUOTES, 'UTF-8') ?></p>
            <a href="index.php" class="btn-secondary" style="display: inline-flex;">Return to Home</a>
        </div>
    <?php else: ?>
        <?php 
            $wordCount = str_word_count(strip_tags($post['content']));
            $readTime = max(1, (int)ceil($wordCount / 200));
            $createdDate = date('F j, Y \a\t g:i A', strtotime($post['created_at']));
        ?>
        <article>
            <header class="post-detail-header">
                <h1 class="post-detail-title"><?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?></h1>
                <div class="post-detail-meta">
                    <span class="post-meta-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Published on <?= $createdDate ?>
                    </span>
                    <span class="post-meta-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <?= $readTime ?> min read
                    </span>
                </div>
            </header>

            <!-- Markdown Content Body -->
            <div class="post-content-body" id="post-markdown-content" data-markdown="<?= htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8') ?>">
                <?= nl2br(htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8')) ?>
            </div>
        </article>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/views/footer.php'; ?>
