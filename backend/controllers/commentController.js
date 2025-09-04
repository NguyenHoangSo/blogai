import Comment from '../models/Comment.js';
import Post from '../models/post.js';
import Notification from '../models/Notification.js';
import { createError } from '../utils/error.js';

export const createComment = async (req, res, next) => {
    try {
        const { content, postId } = req.body;
        const userId = req.user._id;

        // Kiểm tra bài viết có tồn tại không
        const post = await Post.findById({ _id: postId });
        if (!post) {
            return next(createError(404, 'Post not found'));
        }

        // Tạo comment
        const comment = await Comment.create({
            content,
            post: postId,
            author: userId
        });

        // Populate thông tin tác giả
        await comment.populate({
            path: 'author',
            select: 'username profile'
        });

        // Tạo thông báo cho tác giả bài viết
        // await Notification.createNotification({
        //     recipient: post.author,
        //     type: 'comment',
        //     content: `${req.user.username} commented on your post`,
        //     relatedPost: postId,
        //     relatedComment: comment._id,
        //     relatedUser: userId
        // });

        res.status(201).json({
            status: 'success',
            data: {
                comment
            }
        });
    } catch (error) {
        next(error);
    }
};


// Get all comments for a post
export const getPostComments = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { limit = 20, skip = 0, sort = 'newest', includeReplies = false } = req.query;

        const comments = await Comment.getAllComments(postId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort,
            includeReplies: includeReplies === 'true'
        });

        res.status(200).json({
            status: 'success',
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

export const getAllComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({})
            .populate('post', 'title')
            .populate('author', 'username email');
        return res.status(200).json({
            status: "success",
            data: comments
        })
    } catch (error) {
        next(error)
    }
}

// Update a comment
export const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return next(createError(404, 'Comment not found'));
        }

        if (!comment.canEdit(userId)) {
            return next(createError(403, 'Not authorized to edit this comment'));
        }

        comment.content = content;
        comment.metadata.isEdited = true;
        comment.metadata.lastEditedAt = new Date();
        await comment.save();

        res.status(200).json({
            status: 'success',
            data: {
                comment
            }
        });
    } catch (error) {
        next(error);
    }
};

// Delete a comment
export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return next(createError(404, 'Comment not found'));
        }

        if (!comment.canDelete(userId, isAdmin)) {
            return next(createError(403, 'Not authorized to delete this comment'));
        }

        await comment.deleteOne();

        res.status(204).json({
            status: 'No content',
            data: {
                message: "Xóa thành công"
            }
        });
    } catch (error) {
        next(error);
    }
};

// Like/Unlike a comment
export const toggleLike = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }

        const likeIndex = comment.likes.indexOf(req.user._id);

        if (likeIndex === -1) {
            comment.likes.push(req.user._id);
        } else {
            comment.likes.splice(likeIndex, 1);
        }

        await comment.save();

        res.status(200).json({
            status: 'success',
            data: {
                likes: comment.likes
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get comment replies
export const getReplies = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const replies = await Comment.find({ parentComment: commentId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'author',
                select: 'username avatar'
            });

        const totalReplies = await Comment.countDocuments({ parentComment: commentId });

        res.status(200).json({
            status: 'success',
            data: {
                replies,
                pagination: {
                    total: totalReplies,
                    page,
                    pages: Math.ceil(totalReplies / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get replies for a comment
export const getCommentReplies = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { limit = 20, skip = 0, sort = 'newest' } = req.query;

        const replies = await Comment.getCommentReplies(commentId, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort
        });

        res.status(200).json({
            status: 'success',
            data: replies
        });
    } catch (error) {
        next(error);
    }
};

// Moderate a comment
export const moderateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            return next(createError(403, 'Not authorized to moderate comments'));
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return next(createError(404, 'Comment not found'));
        }

        comment.status = status;
        await comment.save();

        // Create notification for comment author
        await Notification.createNotification({
            recipient: comment.author,
            type: status === 'approved' ? 'comment_approved' : 'comment_rejected',
            content: `Your comment has been ${status}`,
            relatedComment: commentId,
            relatedPost: comment.post
        });

        res.status(200).json({
            status: 'success',
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// Like a comment
export const likeComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return next(createError(404, 'Comment not found'));
        }

        await Comment.updateStats(commentId, 'likes', 1);

        // Create notification for comment author
        await Notification.createNotification({
            recipient: comment.author,
            type: 'like',
            content: `${req.user.username} liked your comment`,
            relatedComment: commentId,
            relatedPost: comment.post,
            relatedUser: userId
        });

        res.status(200).json({
            status: 'success',
            message: 'Comment liked successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getReceivedComments = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Lấy tất cả bài viết của user
        const userPosts = await Post.find({ author: userId }).select('_id');

        const postIds = userPosts.map(post => post._id);

        // Lấy tất cả comment thuộc các bài viết đó
        const comments = await Comment.find({ post: { $in: postIds } })
            .populate('author', 'username profile')
            .populate('post', 'title slug')
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }
};