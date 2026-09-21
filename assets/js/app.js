/**
 * DevBlog - Client-Side Interactive Controller
 * Vanilla ES6+ JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initMarkdownRendering();
    initLiveSearch();
    initEditorTabs();
    initEditorToolbar();
    initDeleteModal();
    initForms();
    initCopyLinks();
    initMobileNav();
});

/* ── Mobile Navigation ───────────────────────────────────────────────────── */
function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }
}

/* ── Toast Notifications ─────────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/* ── Markdown Rendering & Syntax Highlighting ────────────────────────────── */
function initMarkdownRendering() {
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined') {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (e) {
                            console.error(e);
                        }
                    }
                    return hljs.highlightAuto(code).value;
                }
                return code;
            }
        });
    }

    // Render static markdown containers if present
    document.querySelectorAll('[data-markdown]').forEach(el => {
        const rawContent = el.getAttribute('data-markdown') || el.textContent;
        if (typeof marked !== 'undefined') {
            el.innerHTML = marked.parse(rawContent);
        }
        if (typeof hljs !== 'undefined') {
            el.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
        }
    });
}

/* ── Live Search Filtering ───────────────────────────────────────────────── */
function initLiveSearch() {
    const searchInput = document.getElementById('search-posts');
    if (!searchInput) return;

    const cards = document.querySelectorAll('.post-card');
    const emptyState = document.getElementById('search-empty-state');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const excerpt = card.getAttribute('data-excerpt') || '';

            if (title.includes(query) || excerpt.includes(query)) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    });
}

/* ── Editor Tabs (Write / Preview) ───────────────────────────────────────── */
function initEditorTabs() {
    const tabWrite = document.getElementById('tab-write');
    const tabPreview = document.getElementById('tab-preview');
    const textarea = document.getElementById('post-content');
    const previewPane = document.getElementById('editor-preview');
    const toolbar = document.querySelector('.editor-toolbar');

    if (!tabWrite || !tabPreview || !textarea || !previewPane) return;

    tabWrite.addEventListener('click', (e) => {
        e.preventDefault();
        tabWrite.classList.add('active');
        tabPreview.classList.remove('active');
        textarea.style.display = 'block';
        previewPane.classList.remove('active');
        if (toolbar) toolbar.style.display = 'flex';
    });

    tabPreview.addEventListener('click', (e) => {
        e.preventDefault();
        tabPreview.classList.add('active');
        tabWrite.classList.remove('active');
        textarea.style.display = 'none';
        previewPane.classList.add('active');
        if (toolbar) toolbar.style.display = 'none';

        const content = textarea.value.trim();
        if (typeof marked !== 'undefined') {
            previewPane.innerHTML = content ? marked.parse(content) : '<p class="text-muted"><em>Nothing to preview yet...</em></p>';
            if (typeof hljs !== 'undefined') {
                previewPane.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
            }
        }
    });
}

/* ── Editor Formatting Toolbar ───────────────────────────────────────────── */
function initEditorToolbar() {
    const textarea = document.getElementById('post-content');
    if (!textarea) return;

    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            insertFormatting(textarea, action);
        });
    });
}

function insertFormatting(textarea, action) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
        case 'bold':
            replacement = `**${selected || 'bold text'}**`;
            cursorOffset = selected ? replacement.length : 2;
            break;
        case 'italic':
            replacement = `*${selected || 'italic text'}*`;
            cursorOffset = selected ? replacement.length : 1;
            break;
        case 'heading':
            replacement = `\n### ${selected || 'Heading'}\n`;
            cursorOffset = replacement.length;
            break;
        case 'code':
            replacement = selected.includes('\n') 
                ? `\n\`\`\`javascript\n${selected || '// code here'}\n\`\`\`\n` 
                : `\`${selected || 'code'}\``;
            cursorOffset = replacement.length;
            break;
        case 'quote':
            replacement = `\n> ${selected || 'Quote text'}\n`;
            cursorOffset = replacement.length;
            break;
        case 'list':
            replacement = `\n- ${selected || 'List item'}\n`;
            cursorOffset = replacement.length;
            break;
        case 'link':
            replacement = `[${selected || 'link text'}](https://example.com)`;
            cursorOffset = replacement.length;
            break;
    }

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
}

/* ── Delete Post Modal ───────────────────────────────────────────────────── */
let postToDeleteId = null;

function initDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('modal-confirm-delete');
    const cancelBtn = document.getElementById('modal-cancel-delete');

    if (!modal) return;

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            postToDeleteId = btn.getAttribute('data-id');
            modal.classList.add('is-active');
        });
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('is-active');
            postToDeleteId = null;
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('is-active');
            postToDeleteId = null;
        }
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (!postToDeleteId) return;

            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Deleting...';

            try {
                const response = await fetch(`api/posts.php?id=${postToDeleteId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();

                if (result.success) {
                    showToast('Post deleted successfully!', 'success');
                    modal.classList.remove('is-active');
                    
                    // If on post detail page, redirect to home
                    if (window.location.pathname.includes('post.php')) {
                        window.location.href = 'index.php';
                    } else {
                        // Remove post card dynamically
                        const card = document.querySelector(`.post-card[data-id="${postToDeleteId}"]`);
                        if (card) {
                            card.style.transition = 'all 0.3s ease';
                            card.style.transform = 'scale(0.9)';
                            card.style.opacity = '0';
                            setTimeout(() => card.remove(), 300);
                        }
                    }
                } else {
                    showToast(result.message || 'Failed to delete post.', 'error');
                }
            } catch (err) {
                showToast('Error connecting to server.', 'error');
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete Post';
            }
        });
    }
}

/* ── Form Handling (Create & Edit) ───────────────────────────────────────── */
function initForms() {
    const createForm = document.getElementById('create-post-form');
    const editForm = document.getElementById('edit-post-form');

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');
            const submitBtn = document.getElementById('submit-btn');

            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (!title) {
                showToast('Please enter a title.', 'error');
                titleInput.focus();
                return;
            }
            if (!content) {
                showToast('Please enter post content.', 'error');
                contentInput.focus();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing...';

            try {
                const res = await fetch('api/posts.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                const data = await res.json();

                if (data.success) {
                    showToast('Post published successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = `post.php?id=${data.id}`;
                    }, 600);
                } else {
                    showToast(data.message || 'Failed to publish post.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Publish Post';
                }
            } catch (err) {
                showToast('Network error while creating post.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Post';
            }
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = document.getElementById('post-id').value;
            const title = document.getElementById('post-title').value.trim();
            const content = document.getElementById('post-content').value.trim();
            const submitBtn = document.getElementById('submit-btn');

            if (!title) {
                showToast('Please enter a title.', 'error');
                return;
            }
            if (!content) {
                showToast('Please enter post content.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                const res = await fetch(`api/posts.php?id=${postId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
                const data = await res.json();

                if (data.success) {
                    showToast('Changes saved successfully!', 'success');
                    setTimeout(() => {
                        window.location.href = `post.php?id=${postId}`;
                    }, 600);
                } else {
                    showToast(data.message || 'Failed to update post.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Changes';
                }
            } catch (err) {
                showToast('Network error while updating post.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        });
    }
}

/* ── Copy Share Link ─────────────────────────────────────────────────────── */
function initCopyLinks() {
    const copyBtn = document.getElementById('btn-copy-link');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Could not copy link.', 'error');
        });
    });
}
