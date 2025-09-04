import express from 'express';
import { verifyToken, verifyAdmin, verifyUser } from '../middleware/auth.js';
import {
    getPosts,
    getFeaturedPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getPostById,
    increaseView,
    toggleLikePost,
    getLikedPosts,
    draftPost
} from '../controllers/postController.js';
import upload from '../middleware/upload.js';
const router = express.Router();



// Public routes
router.get('/', verifyToken, getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/liked', verifyToken, getLikedPosts);
router.get('/:slug', verifyToken, getPostBySlug);
router.get('/post/:id', getPostById);

// Protected routes
router.post('/post', upload.single('coverImage'), createPost);
router.post('/post/draft', upload.single('coverImage'), draftPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);
router.patch('/post/:id', increaseView);
router.put('/:id/like', verifyToken, toggleLikePost);


export default router; 