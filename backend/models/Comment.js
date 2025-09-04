import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Trong models/Comment.js
CommentSchema.statics.getAllComments = async function (postId, options = {}) {
    const {
        limit = 20,
        skip = 0,
        sort = 'newest',
        includeReplies = false
    } = options;

    const sortOption = sort === 'oldest' ? 1 : -1;

    const query = {
        post: postId
    };

    // Nếu không lấy reply thì lọc ra comment cấp 1 (không có parentComment)
    if (!includeReplies) {
        query.parentComment = null;
    }

    const comments = await this.find(query)
        .populate({
            path: 'author',
            select: 'username profile'
        })
        .sort({ createdAt: sortOption })
        .skip(skip)
        .limit(limit);

    return comments.map(comment => ({
        ...comment.toObject(),
        author: {
            ...comment.author.toObject(),
        }
    }));
};

CommentSchema.methods.canDelete = function (userId, isAdmin = false) {
    // Cho phép xóa nếu là admin hoặc là chính chủ bình luận
    return isAdmin || this.author.toString() === userId.toString();
};

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
