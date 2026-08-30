import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { BlogPostRow, CreatePostInput, UpdatePostInput } from '../types/post';

// GET /api/posts - Get all blog posts
export const getAllPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<BlogPostRow[]>(
      'SELECT id, title, content, created_at, updated_at FROM posts ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ message: 'Failed to retrieve blogs. Please try again later.' });
  }
};

// GET /api/posts/:id - Get a single blog post by ID
export const getPostById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<BlogPostRow[]>(
      'SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?',
      [id]
    );

    if (!rows || rows.length === 0) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error fetching post #${id}:`, err.message);
    res.status(500).json({ message: 'Failed to retrieve blog. Please try again later.' });
  }
};

// POST /api/posts - Create a new blog post
export const createPost = async (
  req: Request<Record<string, never>, unknown, CreatePostInput>,
  res: Response
): Promise<void> => {
  const { title, content } = req.body || {};

  // Basic input validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ message: 'Title is required and cannot be empty' });
    return;
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ message: 'Content is required and cannot be empty' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO posts (title, content) VALUES (?, ?)',
      [title.trim(), content.trim()]
    );

    res.status(201).json({
      message: 'Blog created successfully',
      id: result.insertId
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating post:', err.message);
    res.status(500).json({ message: 'Failed to create blog. Please try again later.' });
  }
};

// PUT /api/posts/:id - Update an existing blog post
export const updatePost = async (
  req: Request<{ id: string }, unknown, UpdatePostInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { title, content } = req.body || {};

  // Basic input validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ message: 'Title is required and cannot be empty' });
    return;
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ message: 'Content is required and cannot be empty' });
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title.trim(), content.trim(), id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    res.status(200).json({ message: 'Blog updated successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error updating post #${id}:`, err.message);
    res.status(500).json({ message: 'Failed to update blog. Please try again later.' });
  }
};

// DELETE /api/posts/:id - Delete a blog post
export const deletePost = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Error deleting post #${id}:`, err.message);
    res.status(500).json({ message: 'Failed to delete blog. Please try again later.' });
  }
};
