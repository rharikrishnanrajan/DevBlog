const pool = require('../config/database');

// Helper function to send standard JSON HTTP responses
const sendJson = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

exports.sendJson = sendJson;

// GET /api/posts - Get all blog posts
exports.getAllPosts = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, content, created_at, updated_at FROM posts ORDER BY created_at DESC'
        );
        return sendJson(res, 200, rows);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        return sendJson(res, 500, { message: 'Failed to retrieve blogs. Please try again later.' });
    }
};

// GET /api/posts/:id - Get a single blog post by ID
exports.getPostById = async (req, res, id) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return sendJson(res, 404, { message: 'Blog not found' });
        }

        return sendJson(res, 200, rows[0]);
    } catch (error) {
        console.error(`Error fetching post #${id}:`, error.message);
        return sendJson(res, 500, { message: 'Failed to retrieve blog. Please try again later.' });
    }
};

// POST /api/posts - Create a new blog post
exports.createPost = async (req, res, body) => {
    const { title, content } = body || {};

    // Basic input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
        return sendJson(res, 400, { message: 'Title is required and cannot be empty' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
        return sendJson(res, 400, { message: 'Content is required and cannot be empty' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO posts (title, content) VALUES (?, ?)',
            [title.trim(), content.trim()]
        );

        return sendJson(res, 201, {
            message: 'Blog created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating post:', error.message);
        return sendJson(res, 500, { message: 'Failed to create blog. Please try again later.' });
    }
};

// PUT /api/posts/:id - Update an existing blog post
exports.updatePost = async (req, res, id, body) => {
    const { title, content } = body || {};

    // Basic input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
        return sendJson(res, 400, { message: 'Title is required and cannot be empty' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
        return sendJson(res, 400, { message: 'Content is required and cannot be empty' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title.trim(), content.trim(), id]
        );

        if (result.affectedRows === 0) {
            return sendJson(res, 404, { message: 'Blog not found' });
        }

        return sendJson(res, 200, { message: 'Blog updated successfully' });
    } catch (error) {
        console.error(`Error updating post #${id}:`, error.message);
        return sendJson(res, 500, { message: 'Failed to update blog. Please try again later.' });
    }
};

// DELETE /api/posts/:id - Delete a blog post
exports.deletePost = async (req, res, id) => {
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return sendJson(res, 404, { message: 'Blog not found' });
        }

        return sendJson(res, 200, { message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(`Error deleting post #${id}:`, error.message);
        return sendJson(res, 500, { message: 'Failed to delete blog. Please try again later.' });
    }
};

