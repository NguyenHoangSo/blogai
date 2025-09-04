import mongoose from 'mongoose';
import Post from '../models/post.js';
import Comment from '../models/Comment.js';
import SavedPost from '../models/SavedPost.js';
import { createError } from '../utils/error.js';
import slugify from 'slugify';

// Get all posts with pagination and filtering
export const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';

        const query = {
            status: 'published'
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            // nếu category là ObjectId
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('author', 'username profile')
            .populate('category', 'name') // nếu muốn lấy tên thể loại
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        next(error);
    }
};




// Get featured posts
export const getFeaturedPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ featured: true })
            .populate('author', 'profile')
            .sort({ createdAt: -1 })
            .limit(3);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

// Get single post by slug
export const getPostBySlug = async (req, res, next) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });
        if (!post) {
            return next(createError(404, 'Post not found'));
        }
        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
};
// get a post by id
export const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username email profile') // lấy thông tin người viết
            .populate('tags', 'name')                 // nếu dùng ref tags

        if (!post) {
            return next(createError(404, 'Post not found'));
        }

        res.status(200).json(post);
    } catch (err) {
        next(createError(500, err.message || 'Internal server error'));
    }
};

export const getLikedPosts = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const posts = await Post.find({ likes: userId })
            .populate('author', 'username email profile')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        next(createError(500, err.message || 'Internal server error'));
    }
};

// Create new post
export const createPost = async (req, res, next) => {
    try {
        const {
            title,
            content,
            summary,
            tags,
            status,
            featured,
            isAIGenerated,
            category
        } = req.body;

        const author = req.body.author || req.user?._id; // fallback từ middleware auth

        if (!title || !content || !author) {
            return res.status(400).json({ message: 'Thiếu tiêu đề, nội dung hoặc tác giả.' });
        }

        // Tạo slug nếu chưa có
        const slug = slugify(title, { lower: true, strict: true });

        // Xử lý tags nếu là string
        const parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
        console.log(req.file.path);
        // Xử lý ảnh đại diện nếu có (đã upload và lưu tên file qua multer)
        const coverImage = req.file?.path ? `http://localhost:5000/${req.file?.path.replace(/\\/g, '/')}` : req.body.coverImage || null;

        console.log(coverImage);

        const newPost = new Post({
            author,
            title,
            slug,
            content,
            summary,
            category,
            coverImage,
            tags: parsedTags || [],
            status: status || 'published',
            featured: featured === 'true' || featured === true,
            isAIGenerated: isAIGenerated === 'true' || isAIGenerated === true,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        next(err);
    }
};

// GET /posts?status=draft
export const getPostsByStatus = async (req, res, next) => {
    try {
        const { status } = req.query;
        const userId = req.user._id;

        const query = { author: userId };
        if (status) query.status = status;

        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};


export const draftPost = async (req, res, next) => {
    try {
        const {
            title,
            content,
            summary,
            tags,
            status,
            featured,
            isAIGenerated,
            category
        } = req.body;

        const author = req.body.author || req.user?._id;

        // Cho phép lưu nháp: chỉ cần author tồn tại, không bắt buộc có title/content
        const isDraft = status === 'draft';

        if (!author || (!isDraft && (!title || !content))) {
            return res.status(400).json({
                message: 'Thiếu thông tin: cần có tác giả, và nếu không phải lưu nháp thì cần tiêu đề và nội dung.'
            });
        }

        const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;

        const parsedTags = typeof tags === 'string'
            ? tags.split(',').map(tag => tag.trim())
            : tags;

        const coverImage = req.file?.path
            ? `http://localhost:5000/${req.file?.path.replace(/\\/g, '/')}`
            : req.body.coverImage || null;

        const newPost = new Post({
            author,
            title,
            slug,
            content,
            summary,
            category,
            coverImage,
            tags: parsedTags || [],
            status: isDraft ? 'draft' : 'published',
            featured: featured === 'true' || featured === true,
            isAIGenerated: isAIGenerated === 'true' || isAIGenerated === true,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        next(err);
    }
};


// Update post
export const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(createError(404, 'Post not found'));
        }

        // Check if user is the author or admin
        if (!post.author.equals(req.user._id) && req.user.role !== "admin") {
            return next(createError(403, 'You can only update your own posts'));
        }

        const { title, content, isFeatured, tags, category } = req.body;

        // Update slug if title is changed
        if (title && title !== post.title) {
            post.slug = slugify(title, { lower: true, strict: true });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: title || post.title,
                    content: content || post.content,
                    isFeatured: isFeatured !== undefined ? isFeatured : post.isFeatured,
                    tags: tags || post.tags,
                    category: category || post.category
                }
            },
            { new: true }
        );

        res.status(200).json(updatedPost);
    } catch (err) {
        next(err);
    }
};

// Delete post
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return next(createError(404, 'Post not found'));
        }

        // Check if user is the author or admin
        if (post.author.equals(req.user._id) && req.user.role !== 'admin') {
            return next(createError(403, 'You can only delete your own posts'));
        }

        await SavedPost.findOneAndDelete({ post: post._id });
        await Comment.deleteMany({ post: post._id });

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json('Post has been deleted');
    } catch (err) {
        next(err);
    }
};

// PATCH /api/posts/:id/view
export const increaseView = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return next(createError(404, 'Không tìm thấy bài viết'));
        }

        post.views = (post.views || 0) + 1;
        await post.save();

        return res.status(200).json({
            message: 'View count increased',
            views: post.views
        });
    } catch (err) {
        next(err);
    }
};

export const toggleLikePost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return next(createError(404, "Bài viết không tồn tại"));

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike
            post.likes.pull(userId);
            post.stats.likesCount = Math.max((post.stats.likesCount || 1) - 1, 0);
        } else {
            // Like
            post.likes.push(userId);
            post.stats.likesCount = (post.stats.likesCount || 0) + 1;
        }

        await post.save();
        res.status(200).json({
            liked: !alreadyLiked,
            likesCount: post.stats.likesCount,
            likes: post.likes
        });

    } catch (error) {
        next(error)
    }
};


