import express from 'express';
import checkAuth, { processToken } from '../../middlewares/auth/check-auth.js';
import {
  createComment,
  getComments,
  deleteComment,
} from '../../controllers/comment/comment.controller.js';

const router = express.Router();

// Get all comments
router.get('/', processToken, getComments);

// Create a new comment
router.post('/', processToken, createComment);

// Delete a comment
router.delete('/:id', checkAuth, deleteComment);

export default router;
