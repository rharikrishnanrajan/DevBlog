import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} from '../controllers/postController';
import { writeOperationsRateLimiter } from '../middleware/security';

const router = Router();

// Routes for /api/posts
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', writeOperationsRateLimiter, createPost);
router.put('/:id', writeOperationsRateLimiter, updatePost);
router.delete('/:id', writeOperationsRateLimiter, deletePost);

export default router;

