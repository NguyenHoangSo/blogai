import express from 'express';
import {
    createComment,
    updateComment,
    deleteComment,
    getPostComments,
    getReplies,
    toggleLike,
    getReceivedComments,
    getAllComments
} from '../controllers/commentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', getPostComments);
router.get('/received', verifyToken, getReceivedComments);
router.get('/', verifyToken, getAllComments);

// Get replies for a comment
router.get('/:commentId/replies', getReplies);

// Protected routes
// router.use(protect);

// Create a comment
router.post('/', verifyToken, createComment);

// Update a comment
router.patch('/:commentId', updateComment);

// Delete a comment
router.delete('/:commentId', verifyToken, deleteComment);

// Like/Unlike a comment
router.post('/:commentId/like', toggleLike);

export default router; 