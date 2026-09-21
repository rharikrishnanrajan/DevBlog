<?php
/**
 * DevBlog - Homepage & Post Listing
 */

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';

$pageTitle = 'DevBlog - Home';
$posts = [];
$dbError = null;

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query('
        SELECT id, title, content, created_at, updated_at 
        FROM posts 
        ORDER BY created_at DESC
    ');
    $posts = $stmt->fetchAll();
} catch (Throwable $e) {
    $dbError = $e->getMessage();
}

require_once __DIR__ . '/views/header.php';
?>

<!-- Hero Banner -->
<section class="hero-section">
    <div class="hero-badge">
        <span>⚡</span> Developer-Centric Blog Platform
    </div>
    <h1 class="hero-title">Engineering Thoughts & Tutorials</h1>
    <p class="hero-subtitle">Exploring modern full-stack development, software architecture, backend engineering, and clean code.</p>
    
    <!-- Live Search Bar -->
    <div class="search-container">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="search-posts" class="search-input" placeholder="Search articles by title or keyword..." autocomplete="off">
    </div>
</section>

<?php if ($dbError): ?>
    <div class="empty-state" style="border-color: var(--accent-red); margin-bottom: 2rem;">
        <div class="empty-icon">⚠️</div>
        <h2 class="empty-title" style="color: var(--accent-red);">Database Connection Notice</h2>
        <p class="empty-text">Could not connect to the local MySQL database. Please make sure MySQL is running on <code>localhost:3306</code> and the database <code>blog</code> is initialized.</p>
        <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted);"><?= htmlspecialchars($dbError, ENT_QUOTES, 'UTF-8') ?></p>
    </div>
<?php endif; ?>

<!-- Posts Grid -->
<section class="posts-grid" id="posts-container">
    <?php if (empty($posts) && !$dbError): ?>
        <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h2 class="empty-title">No Blog Posts Yet</h2>
            <p class="empty-text">Be the first to share your engineering ideas, guides, or snippets with the community.</p>
            <a href="create.php" class="nav-btn" style="display: inline-flex;">Write Your First Post</a>
        </div>
    <?php else: ?>
        <?php foreach ($posts as $post): ?>
            <?php 
                $cleanExcerpt = strip_tags($post['content']);
                $cleanExcerpt = preg_replace('/[#*`_>\[\]]/', '', $cleanExcerpt);
                $formattedDate = date('M j, Y', strtotime($post['created_at']));
            ?>
            <article class="post-card" 
                     data-id="<?= (int)$post['id'] ?>" 
                     data-title="<?= htmlspecialchars(strtolower($post['title']), ENT_QUOTES, 'UTF-8') ?>" 
                     data-excerpt="<?= htmlspecialchars(strtolower($cleanExcerpt), ENT_QUOTES, 'UTF-8') ?>">
                <div>
                    <div class="post-card-header">
                        <span class="post-card-date">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <?= $formattedDate ?>
                        </span>
                        <h2 class="post-card-title">
                            <a href="post.php?id=<?= (int)$post['id'] ?>">
                                <?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?>
                            </a>
                        </h2>
                    </div>
                    <p class="post-card-excerpt">
                        <?= htmlspecialchars(mb_substr($cleanExcerpt, 0, 160) . (mb_strlen($cleanExcerpt) > 160 ? '...' : ''), ENT_QUOTES, 'UTF-8') ?>
                    </p>
                </div>
                
                <div class="post-card-footer">
                    <a href="post.php?id=<?= (int)$post['id'] ?>" class="post-read-link">
                        Read article &rarr;
                    </a>
                    <div class="post-card-actions">
                        <a href="edit.php?id=<?= (int)$post['id'] ?>" class="action-btn" title="Edit Post">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            Edit
                        </a>
                        <button type="button" class="action-btn delete-btn" data-id="<?= (int)$post['id'] ?>" title="Delete Post">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </article>
        <?php endforeach; ?>
    <?php endif; ?>

    <!-- Empty Search State Placeholder (hidden by default) -->
    <div class="empty-state" id="search-empty-state" style="display: none;">
        <div class="empty-icon">🔍</div>
        <h2 class="empty-title">No Matching Articles Found</h2>
        <p class="empty-text">Try searching with a different term or keyword.</p>
    </div>
</section>

<?php require_once __DIR__ . '/views/footer.php'; ?>
