import Post from '../models/post.js';
import SavedPost from '../models/SavedPost.js';
import { createError } from '../utils/error.js';
// import Post from '../models/Post';

// Lấy danh sách bài viết đã lưu của user
export const getSavedPosts = async (req, res) => {
    try {
        const savedPosts = await SavedPost.find({ user: req.user._id })
            .populate({
                path: 'post',
                select: 'title content coverImage category createdAt slug author',
                populate: {
                    path: 'author',
                    select: 'username avatar'
                }
            })
            .sort({ createdAt: -1 });

        // Chỉ lấy những bài viết còn tồn tại
        const posts = savedPosts
            .filter(savedPost => savedPost.post !== null)
            .map(savedPost => ({
                ...savedPost.post.toObject(),
                isSaved: true
            }));

        res.json({ posts });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã lưu' });
    }
};

// Lưu bài viết
export const savePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        // Kiểm tra xem bài viết có tồn tại không
        const postExists = await Post.exists({ _id: postId });
        if (!postExists) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        // Tạo và lưu - để MongoDB bắt duplicate
        const savedPost = new SavedPost({ user: userId, post: postId });
        await savedPost.save();

        res.status(201).json({ message: 'Đã lưu bài viết thành công' });

    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error từ unique index
            return res.status(400).json({ message: 'Bài viết đã được lưu trước đó' });
        }
        next(createError(500, error.message || 'Lỗi khi lưu bài viết'));
    }
};

// Bỏ lưu bài viết
export const unsavePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const result = await SavedPost.findOneAndDelete({
            user: req.user._id,
            post: postId
        });

        if (!result) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết đã lưu' });
        }

        res.json({ message: 'Đã bỏ lưu bài viết thành công' });
    } catch (error) {
        console.error('Error unsaving post:', error);
        res.status(500).json({ message: 'Lỗi khi bỏ lưu bài viết' });
    }
};

// Kiểm tra xem bài viết đã được lưu chưa
export const checkSavedStatus = async (req, res) => {
    try {
        const { postId } = req.params;

        const savedPost = await SavedPost.findOne({
            user: req.user._id,
            post: postId
        });

        res.json({ isSaved: !!savedPost });
    } catch (error) {
        console.error('Error checking saved status:', error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái lưu bài viết' });
    }
};