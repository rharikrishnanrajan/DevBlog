import { Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import pool, { isDbConnected } from '../config/database';
import { BlogPost, BlogPostRow, CreatePostInput, UpdatePostInput } from '../types/post';

// ── Validation Constants ─────────────────────────────────────────────────────
const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 65535;

/**
 * Validates and safely parses an ID parameter into a positive 32-bit integer.
 * Guards against non-integer inputs, SQL injection strings, and integer overflow attacks.
 */
function parseAndValidateId(idParam: string | undefined): number | null {
  if (!idParam || typeof idParam !== 'string') {
    return null;
  }
  const trimmed = idParam.trim();
  // Must be strictly digits (1 to 10 digits), positive non-zero
  if (!/^[1-9]\d{0,9}$/.test(trimmed)) {
    return null;
  }
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num <= 0 || num > 2147483647) {
    return null;
  }
  return num;
}

// In-memory fallback post store (ensures site is functional even if database is offline or unconfigured)
let fallbackPosts: BlogPost[] = [
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
      // Using execute for prepared statement execution
      const [rows] = await pool.execute<BlogPostRow[]>(
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
  const validId = parseAndValidateId(req.params.id);

  if (validId === null) {
    res.status(400).json({ message: 'Invalid blog post ID. ID must be a positive integer.' });
    return;
  }

  if (isDbConnected()) {
    try {
      // Binary prepared statement: pool.execute guarantees strict parameter separation (100% immune to SQLi)
      const [rows] = await pool.execute<BlogPostRow[]>(
        'SELECT id, title, content, created_at, updated_at FROM posts WHERE id = ?',
        [validId]
      );

      if (rows && rows.length > 0) {
        res.status(200).json(rows[0]);
        return;
      }
      res.status(404).json({ message: 'Blog not found' });
      return;
    } catch (error: unknown) {
      console.warn(`MySQL query for post #${validId} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback lookup
  const post = fallbackPosts.find((p) => p.id === validId);
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

  // Strict input validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ message: 'Title is required and cannot be empty' });
    return;
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    res.status(400).json({
      message: `Title is too long. Maximum allowed length is ${MAX_TITLE_LENGTH} characters.`
    });
    return;
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ message: 'Content is required and cannot be empty' });
    return;
  }

  const cleanContent = content.trim();
  if (cleanContent.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({
      message: `Content is too long. Maximum allowed length is ${MAX_CONTENT_LENGTH} characters.`
    });
    return;
  }

  if (isDbConnected()) {
    try {
      // Binary prepared statement execution
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO posts (title, content) VALUES (?, ?)',
        [cleanTitle, cleanContent]
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
  const newPost: BlogPost = {
    id: nextFallbackId++,
    title: cleanTitle,
    content: cleanContent,
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
  const validId = parseAndValidateId(req.params.id);

  if (validId === null) {
    res.status(400).json({ message: 'Invalid blog post ID. ID must be a positive integer.' });
    return;
  }

  const { title, content } = req.body || {};

  // Strict input validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ message: 'Title is required and cannot be empty' });
    return;
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    res.status(400).json({
      message: `Title is too long. Maximum allowed length is ${MAX_TITLE_LENGTH} characters.`
    });
    return;
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ message: 'Content is required and cannot be empty' });
    return;
  }

  const cleanContent = content.trim();
  if (cleanContent.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({
      message: `Content is too long. Maximum allowed length is ${MAX_CONTENT_LENGTH} characters.`
    });
    return;
  }

  if (isDbConnected()) {
    try {
      // Binary prepared statement execution
      const [result] = await pool.execute<ResultSetHeader>(
        'UPDATE posts SET title = ?, content = ? WHERE id = ?',
        [cleanTitle, cleanContent, validId]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }

      res.status(200).json({ message: 'Blog updated successfully' });
      return;
    } catch (error: unknown) {
      console.warn(`MySQL update for post #${validId} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback update
  const index = fallbackPosts.findIndex((p) => p.id === validId);
  if (index === -1) {
    res.status(404).json({ message: 'Blog not found' });
    return;
  }

  fallbackPosts[index] = {
    ...fallbackPosts[index],
    title: cleanTitle,
    content: cleanContent,
    updated_at: new Date().toISOString()
  };

  res.status(200).json({ message: 'Blog updated successfully' });
};

// DELETE /api/posts/:id - Delete a blog post
export const deletePost = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const validId = parseAndValidateId(req.params.id);

  if (validId === null) {
    res.status(400).json({ message: 'Invalid blog post ID. ID must be a positive integer.' });
    return;
  }

  if (isDbConnected()) {
    try {
      // Binary prepared statement execution
      const [result] = await pool.execute<ResultSetHeader>('DELETE FROM posts WHERE id = ?', [validId]);

      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Blog not found' });
        return;
      }

      res.status(200).json({ message: 'Blog deleted successfully' });
      return;
    } catch (error: unknown) {
      console.warn(`MySQL delete for post #${validId} failed, falling back to memory store:`, (error as Error).message);
    }
  }

  // Fallback delete
  const index = fallbackPosts.findIndex((p) => p.id === validId);
  if (index === -1) {
    res.status(404).json({ message: 'Blog not found' });
    return;
  }

  fallbackPosts.splice(index, 1);
  res.status(200).json({ message: 'Blog deleted successfully' });
};
