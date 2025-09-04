import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tag name is required'],
        trim: true,
        unique: true,
        maxlength: [30, 'Tag name cannot be more than 30 characters']
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    stats: {
        postCount: {
            type: Number,
            default: 0
        },
        followerCount: {
            type: Number,
            default: 0
        },
        viewCount: {
            type: Number,
            default: 0
        }
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
tagSchema.index({ slug: 1 });
tagSchema.index({ 'stats.postCount': -1 });
tagSchema.index({ 'stats.viewCount': -1 });

// Virtual field for posts with this tag
tagSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'tags'
});

// Middleware to generate slug
tagSchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    next();
});

// Static method to get trending tags
tagSchema.statics.getTrendingTags = function (limit = 10) {
    return this.find()
        .sort({ 'stats.viewCount': -1, 'stats.postCount': -1 })
        .limit(limit)
        .select('name slug description stats.postCount');
};

// Static method to get related tags
tagSchema.statics.getRelatedTags = async function (tagId, limit = 5) {
    const tag = await this.findById(tagId).populate('posts');
    if (!tag) return [];

    const postIds = tag.posts.map(post => post._id);

    return this.aggregate([
        {
            $match: {
                _id: { $ne: tagId },
                'posts': { $in: postIds }
            }
        },
        {
            $project: {
                name: 1,
                slug: 1,
                commonPosts: {
                    $size: {
                        $setIntersection: ['$posts', postIds]
                    }
                }
            }
        },
        {
            $sort: { commonPosts: -1 }
        },
        {
            $limit: limit
        }
    ]);
};

// Static method to search tags
tagSchema.statics.searchTags = function (query, limit = 10) {
    return this.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    })
        .sort({ 'stats.postCount': -1 })
        .limit(limit)
        .select('name slug description stats.postCount');
};

const Tag = mongoose.model('Tag', tagSchema);

export default Tag; 