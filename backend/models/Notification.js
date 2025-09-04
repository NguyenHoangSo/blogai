import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'comment',
            'reply',
            'like',
            'follow',
            'mention',
            'post_approved',
            'post_rejected',
            'system'
        ]
    },
    content: {
        type: String,
        required: true
    },
    relatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    relatedComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        expiresAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = function (userId) {
    return this.countDocuments({
        recipient: userId,
        isRead: false
    });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = function (userId, notificationIds = []) {
    const query = {
        recipient: userId,
        isRead: false
    };

    if (notificationIds.length > 0) {
        query._id = { $in: notificationIds };
    }

    return this.updateMany(query, { isRead: true });
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function (userId, options = {}) {
    const {
        limit = 20,
        skip = 0,
        type,
        isRead
    } = options;

    const query = { recipient: userId };

    if (type) query.type = type;
    if (typeof isRead === 'boolean') query.isRead = isRead;

    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('relatedPost', 'title slug')
        .populate('relatedComment', 'content')
        .populate('relatedUser', 'username avatar');
};

// Static method to create notification
notificationSchema.statics.createNotification = function (data) {
    return this.create({
        recipient: data.recipient,
        type: data.type,
        content: data.content,
        relatedPost: data.relatedPost,
        relatedComment: data.relatedComment,
        relatedUser: data.relatedUser,
        metadata: data.metadata
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 