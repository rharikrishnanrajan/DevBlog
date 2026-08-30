const pool = require('../config/database');

// GET /api/posts - Get all blog posts
exports.getAllPosts = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, content, created_at, updated_at FROM posts ORDER BY created_at DESC'
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        return res.status(500).json({ message: 'Failed to retrieve blogs. Please try again later.' });
    }
};

// GET /api/posts/:id - Get a single blog post by ID
exports.getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error fetching post #${id}:`, error.message);
        return res.status(500).json({ message: 'Failed to retrieve blog. Please try again later.' });
    }
};

// POST /api/posts - Create a new blog post
exports.createPost = async (req, res) => {
    const { title, content } = req.body;

    // Basic input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'Content is required and cannot be empty' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO posts (title, content) VALUES (?, ?)',
            [title.trim(), content.trim()]
        );

        return res.status(201).json({
            message: 'Blog created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error('Error creating post:', error.message);
        return res.status(500).json({ message: 'Failed to create blog. Please try again later.' });
    }
};

// PUT /api/posts/:id - Update an existing blog post
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // Basic input validation
    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Title is required and cannot be empty' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'Content is required and cannot be empty' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE posts SET title = ?, content = ? WHERE id = ?',
            [title.trim(), content.trim(), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        return res.status(200).json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error(`Error updating post #${id}:`, error.message);
        return res.status(500).json({ message: 'Failed to update blog. Please try again later.' });
    }
};

// DELETE /api/posts/:id - Delete a blog post
exports.deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        return res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(`Error deleting post #${id}:`, error.message);
        return res.status(500).json({ message: 'Failed to delete blog. Please try again later.' });
    }
};
