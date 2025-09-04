import express from 'express';
import router from 'express';
// import bookmarkController from '../controllers/bookmarkController.js';
// import { protect } from '../middleware/auth.js';

// All routes require authentication
router.use(protect);

// Get user bookmarks
router.get('/', bookmarkController.getUserBookmarks);

// Get bookmark collections
router.get('/collections', bookmarkController.getCollections);

// Get bookmark tags
router.get('/tags', bookmarkController.getTags);

// Create a bookmark
router.post('/', bookmarkController.createBookmark);

// Update a bookmark
router.patch('/:bookmarkId', bookmarkController.updateBookmark);

// Delete a bookmark
router.delete('/:bookmarkId', bookmarkController.deleteBookmark);

module.exports = router; 