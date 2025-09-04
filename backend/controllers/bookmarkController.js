import Bookmark from '../models/Bookmark.js ';
import Notification from '../models/Notification.js';
import { createError } from '../utils/error.js';

// Get user bookmarks
exports.getUserBookmarks = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit = 20, skip = 0, sort = 'newest', collection = null, tags = [] } = req.query;

        const bookmarks = await Bookmark.getUserBookmarks(userId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort,
            collection,
            tags
        });

        res.json({
            success: true,
            data: bookmarks
        });
    } catch (error) {
        next(error);
    }
};

// Create a bookmark
exports.createBookmark = async (req, res, next) => {
    try {
        const { postId, collection = 'default', tags = [], notes = '' } = req.body;
        const userId = req.user._id;

        const bookmark = await Bookmark.create({
            user: userId,
            post: postId,
            collection,
            tags,
            notes
        });

        // Create notification for post author
        await Notification.createNotification({
            recipient: req.post.author,
            type: 'bookmark',
            content: `${req.user.username} bookmarked your post`,
            relatedPost: postId,
            relatedUser: userId
        });

        res.status(201).json({
            success: true,
            data: bookmark
        });
    } catch (error) {
        next(error);
    }
};

// Update a bookmark
exports.updateBookmark = async (req, res, next) => {
    try {
        const { bookmarkId } = req.params;
        const { collection, tags, notes, isPrivate } = req.body;
        const userId = req.user._id;

        const bookmark = await Bookmark.findById(bookmarkId);
        if (!bookmark) {
            return next(createError(404, 'Bookmark not found'));
        }

        if (bookmark.user.toString() !== userId.toString()) {
            return next(createError(403, 'Not authorized to update this bookmark'));
        }

        if (collection) bookmark.collection = collection;
        if (tags) bookmark.tags = tags;
        if (notes) bookmark.notes = notes;
        if (typeof isPrivate === 'boolean') {
            bookmark.metadata.isPrivate = isPrivate;
        }

        await bookmark.save();

        res.json({
            success: true,
            data: bookmark
        });
    } catch (error) {
        next(error);
    }
};

// Delete a bookmark
exports.deleteBookmark = async (req, res, next) => {
    try {
        const { bookmarkId } = req.params;
        const userId = req.user._id;

        const bookmark = await Bookmark.findById(bookmarkId);
        if (!bookmark) {
            return next(createError(404, 'Bookmark not found'));
        }

        if (bookmark.user.toString() !== userId.toString()) {
            return next(createError(403, 'Not authorized to delete this bookmark'));
        }

        await bookmark.remove();

        res.json({
            success: true,
            message: 'Bookmark deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get bookmark collections
exports.getCollections = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const collections = await Bookmark.getCollections(userId);

        res.json({
            success: true,
            data: collections
        });
    } catch (error) {
        next(error);
    }
};

// Get bookmark tags
exports.getTags = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const tags = await Bookmark.getTags(userId);

        res.json({
            success: true,
            data: tags
        });
    } catch (error) {
        next(error);
    }
}; 