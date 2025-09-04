import express from 'express';
const router = express.Router();
import { getSavedPosts, savePost, checkSavedStatus, unsavePost } from '../controllers/savedPostController.js';
import { verifyToken } from '../middleware/auth.js';
// import auth from '../middleware/auth.js';

// // Tất cả routes đều yêu cầu xác thực
// router.use(auth);

// Lấy danh sách bài viết đã lưu
router.get('/saved', verifyToken, getSavedPosts);

// Lưu bài viết
router.post('/:postId/save', verifyToken, savePost);

// Bỏ lưu bài viết
router.post('/:postId/unsave', verifyToken, unsavePost);

// Kiểm tra trạng thái lưu bài viết
router.get('/:postId/saved-status', checkSavedStatus);

export default router;  