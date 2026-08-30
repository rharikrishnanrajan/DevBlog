import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool, { isDbConnected } from '../config/database';
import { BlogPostRow, CreatePostInput, UpdatePostInput } from '../types/post';

// In-memory fallback post store (ensures site is functional even if database is offline or unconfigured)
let fallbackPosts: BlogPostRow[] = [
  {
    id: 1,
    title: 'Building Scalable APIs with TypeScript & Express',
    content: 'TypeScript brings type safety, predictable contracts, and rich tooling to Express.js. Combining structured routing, clean error handling, and robust database pooling creates enterprise-ready backends capable of scaling with demand.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    title: 'Mastering Full-Stack Deployment: Unified Frontend & Backend',
    content: 'Serving single-page applications directly through Express simplifies deployment pipelines, eliminates CORS complications, and allows hosting both UI and REST API on a single container or serverless instance.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];
let nextFallbackId = 3;

// GET /api/posts - Get all blog posts
export const getAllPosts = async (_req: Request, res: Response): Promise<void> => {
  if (isDbConnected()) {
    try {
      const [rows] = await pool.query<BlogPostRow[]>(
        'SELECT id, title, content, created_at, updated_at FROM posts ORDER BY created_at DESC'
      );
      res.status(200).json(rows);
      return;
    } catch (error: unknown) {
      console.warn('MySQL query failed, falling back to memory store:', (error as Error).message);
    }
  }

  // Fallback to in-memory store
  const sorted = [...fallbackPosts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.status(200).json(sorted);
};

// GET /api/posts/:id - Get a single blog post by ID
export const getPostById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isDbConnected()) {
    try {
      const [rows] = await pool.query<BlogPostRow[]>(
        'SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?',
        [id]
      );

      if (rows && rows.length > 0) {
        res.status(200).json(rows[0]);
        return;
      }
      res.status(404).json({ message: 'Blog not found' });
      return;
    } catch (error: unknown) {
      console.warn(`MySQL query for post #${id} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback lookup
  const post = fallbackPosts.find((p) => p.id === numId);
  if (!post) {
    res.status(404).json({ message: 'Blog not found' });
    return;
  }
  res.status(200).json(post);
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

  if (isDbConnected()) {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO posts (title, content) VALUES (?, ?)',
        [title.trim(), content.trim()]
      );

      res.status(201).json({
        message: 'Blog created successfully',
        id: result.insertId
      });
      return;
    } catch (error: unknown) {
      console.warn('MySQL insert failed, falling back to memory store:', (error as Error).message);
    }
  }

  // Fallback creation
  const newPost: BlogPostRow = {
    id: nextFallbackId++,
    title: title.trim(),
    content: content.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  fallbackPosts.unshift(newPost);

  res.status(201).json({
    message: 'Blog created successfully',
    id: newPost.id
  });
};

// PUT /api/posts/:id - Update an existing blog post
export const updatePost = async (
  req: Request<{ id: string }, unknown, UpdatePostInput>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const numId = parseInt(id, 10);
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

  if (isDbConnected()) {
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
      return;
    } catch (error: unknown) {
      console.warn(`MySQL update for post #${id} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback update
  const index = fallbackPosts.findIndex((p) => p.id === numId);
  if (index === -1) {
    res.status(404).json({ message: 'Blog not found' });
    return;
  }

  fallbackPosts[index] = {
    ...fallbackPosts[index],
    title: title.trim(),
    content: content.trim(),
    updated_at: new Date().toISOString()
  };

  res.status(200).json({ message: 'Blog updated successfully' });
};

// DELETE /api/posts/:id - Delete a blog post
export const deletePost = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const numId = parseInt(id, 10);

  if (isDbConnected()) {
    try {
      const [result] = await pool.query<ResultSetHeader>('DELETE FROM posts WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }

      res.status(200).json({ message: 'Blog deleted successfully' });
      return;
    } catch (error: unknown) {
      console.warn(`MySQL delete for post #${id} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback delete
  const index = fallbackPosts.findIndex((p) => p.id === numId);
  if (index === -1) {
    res.status(404).json({ message: 'Blog not found' });
    return;
  }

  fallbackPosts.splice(index, 1);
  res.status(200).json({ message: 'Blog deleted successfully' });
};
