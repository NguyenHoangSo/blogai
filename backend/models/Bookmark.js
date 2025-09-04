import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post reference is required'],
        index: true
    },
    collection: {
        type: String,
        default: 'default',
        index: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    metadata: {
        isPrivate: {
            type: Boolean,
            default: false
        },
        lastAccessed: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Compound index for unique bookmarks
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });

// Static method to get user bookmarks
bookmarkSchema.statics.getUserBookmarks = function (userId, options = {}) {
    const {
        limit = 20,
        skip = 0,
        sort = 'newest',
        collection = null,
        tags = []
    } = options;

    const query = { user: userId };
    if (collection) query.collection = collection;
    if (tags.length > 0) query.tags = { $in: tags };

    const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        lastAccessed: { 'metadata.lastAccessed': -1 }
    };

    return this.find(query)
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .populate('post', 'title slug author tags createdAt')
        .populate('post.author', 'username avatar');
};

// Static method to get bookmark collections
bookmarkSchema.statics.getCollections = function (userId) {
    return this.distinct('collection', { user: userId });
};

// Static method to get bookmark tags
bookmarkSchema.statics.getTags = function (userId) {
    return this.distinct('tags', { user: userId });
};

// Static method to update bookmark metadata
bookmarkSchema.statics.updateMetadata = async function (bookmarkId, updates) {
    return this.findByIdAndUpdate(
        bookmarkId,
        { $set: { 'metadata': updates } },
        { new: true }
    );
};

// Method to check if bookmark is private
bookmarkSchema.methods.isPrivate = function () {
    return this.metadata.isPrivate;
};

// Method to update metadata
bookmarkSchema.methods.updateMetadata = function (updates) {
    Object.assign(this.metadata, updates);
    return this.save();
};

// Method to update last accessed time
bookmarkSchema.methods.updateLastAccessed = function () {
    this.metadata.lastAccessed = new Date();
    return this.save();
};

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark; 