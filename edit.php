<?php
/**
 * DevBlog - Edit Blog Post
 */

declare(strict_types=1);

require_once __DIR__ . '/config/database.php';

$postId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
$post = null;
$error = null;

if (!$postId) {
    $error = 'Invalid blog post ID provided.';
} else {
    try {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT id, title, content FROM posts WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $postId]);
        $post = $stmt->fetch();

        if (!$post) {
            $error = 'The requested blog post was not found.';
        }
    } catch (Throwable $e) {
        $error = 'Database error: ' . $e->getMessage();
    }
}

$pageTitle = $post ? 'Edit: ' . htmlspecialchars($post['title']) . ' - DevBlog' : 'Edit Post - DevBlog';
require_once __DIR__ . '/views/header.php';
?>

<div class="form-container">
    <div class="form-header">
        <h1 class="form-title">
            <span>✏️</span> Edit Blog Post
        </h1>
        <p style="color: var(--text-secondary); margin-top: 0.25rem;">Update your title or markdown content.</p>
    </div>

    <?php if ($error || !$post): ?>
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h2 class="empty-title">Cannot Edit Post</h2>
            <p class="empty-text"><?= htmlspecialchars($error ?? 'Post does not exist.', ENT_QUOTES, 'UTF-8') ?></p>
            <a href="index.php" class="btn-secondary" style="display: inline-flex;">Return to Home</a>
        </div>
    <?php else: ?>
        <form id="edit-post-form">
            <input type="hidden" id="post-id" value="<?= (int)$post['id'] ?>">

            <div class="form-group">
                <label for="post-title" class="form-label">Article Title</label>
                <input type="text" id="post-title" name="title" class="form-input" value="<?= htmlspecialchars($post['title'], ENT_QUOTES, 'UTF-8') ?>" required maxlength="255" autocomplete="off">
            </div>

            <div class="form-group">
                <div class="editor-tabs">
                    <button type="button" class="editor-tab-btn active" id="tab-write">Write</button>
                    <button type="button" class="editor-tab-btn" id="tab-preview">Preview</button>
                </div>

                <div class="editor-toolbar">
                    <button type="button" class="toolbar-btn" data-action="heading" title="Heading (H3)">H</button>
                    <button type="button" class="toolbar-btn" data-action="bold" title="Bold"><strong>B</strong></button>
                    <button type="button" class="toolbar-btn" data-action="italic" title="Italic"><em>I</em></button>
                    <button type="button" class="toolbar-btn" data-action="code" title="Code Block">&lt;/&gt;</button>
                    <button type="button" class="toolbar-btn" data-action="quote" title="Quote">&ldquo;</button>
                    <button type="button" class="toolbar-btn" data-action="list" title="List">&bull; List</button>
                    <button type="button" class="toolbar-btn" data-action="link" title="Link">&#128279; Link</button>
                </div>

                <textarea id="post-content" name="content" class="editor-textarea" required><?= htmlspecialchars($post['content'], ENT_QUOTES, 'UTF-8') ?></textarea>

                <div id="editor-preview" class="editor-preview-pane post-content-body"></div>
            </div>

            <div class="form-actions">
                <a href="post.php?id=<?= (int)$post['id'] ?>" class="btn-secondary">Cancel</a>
                <button type="submit" class="btn-primary" id="submit-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save Changes
                </button>
            </div>
        </form>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/views/footer.php'; ?>
