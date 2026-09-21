<?php
/**
 * DevBlog - Create New Blog Post
 */

declare(strict_types=1);

$pageTitle = 'Write a New Blog - DevBlog';
require_once __DIR__ . '/views/header.php';
?>

<div class="form-container">
    <div class="form-header">
        <h1 class="form-title">
            <span>✍️</span> Write New Blog Post
        </h1>
        <p style="color: var(--text-secondary); margin-top: 0.25rem;">Share your knowledge, tutorials, or architecture notes using Markdown.</p>
    </div>

    <form id="create-post-form">
        <div class="form-group">
            <label for="post-title" class="form-label">Article Title</label>
            <input type="text" id="post-title" name="title" class="form-input" placeholder="e.g. Mastering Asynchronous Programming in PHP & Node" required maxlength="255" autocomplete="off">
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

            <textarea id="post-content" name="content" class="editor-textarea" placeholder="Write your post content in Markdown...

# Introduction
Explain your topic here.

```javascript
// Sample code snippet
console.log('Hello World!');
```
" required></textarea>

            <div id="editor-preview" class="editor-preview-pane post-content-body"></div>
        </div>

        <div class="form-actions">
            <a href="index.php" class="btn-secondary">Cancel</a>
            <button type="submit" class="btn-primary" id="submit-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Publish Post
            </button>
        </div>
    </form>
</div>

<?php require_once __DIR__ . '/views/footer.php'; ?>
