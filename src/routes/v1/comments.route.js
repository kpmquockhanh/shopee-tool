import express from 'express';
import checkAuth, { processToken } from '../../middlewares/auth/check-auth.js';
import {
  createComment,
  getComments,
  getPostComments,
  deleteComment,
  createPostComment,
} from '../../controllers/comment/comment.controller.js';

const router = express.Router();

// Get all comments
router.get('/', processToken, getComments);

// Get post comments
router.get('/post/:id', processToken, getPostComments);

// Create a new comment
router.post('/', processToken, createComment);
router.post('/post/:id', processToken, createPostComment);

// Delete a comment
router.delete('/:id', checkAuth, deleteComment);

export default router;
