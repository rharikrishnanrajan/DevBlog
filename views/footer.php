    </main>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" id="delete-modal" aria-hidden="true">
        <div class="modal-box">
            <h3 class="modal-title">Delete Blog Post?</h3>
            <p class="modal-body">Are you sure you want to permanently delete this blog post? This action cannot be undone.</p>
            <div class="modal-actions">
                <button type="button" class="btn-secondary" id="modal-cancel-delete">Cancel</button>
                <button type="button" class="btn-primary" id="modal-confirm-delete" style="background-color: var(--accent-red);">Delete Post</button>
            </div>
        </div>
    </div>

    <!-- Toast Notification Container -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Global Footer -->
    <footer class="site-footer">
        <div class="footer-container">
            <p>&copy; <?= date('Y') ?> DevBlog &bull; Minimalist Developer Platform</p>
            <div class="footer-links">
                <a href="index.php" class="footer-link">Home</a>
                <a href="create.php" class="footer-link">Write Post</a>
                <a href="api/health.php" target="_blank" class="footer-link">System Health</a>
            </div>
        </div>
    </footer>

    <!-- Client-Side Application JavaScript -->
    <script src="assets/js/app.js"></script>
</body>
</html>
