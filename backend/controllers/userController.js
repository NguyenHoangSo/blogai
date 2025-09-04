import User from '../models/user.js';
import { createError } from '../utils/error.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

// Get all users
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// Get single user
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Create user (Registration)
export const createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return next(createError(400, 'Tên đăng nhập hoặc email đã tồn tại'));
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(201).json({
            message: 'User registered successfully',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        next(error);
    }
};

// Update user
export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Delete user
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(createError(401, 'Mật khẩu hoặc email không hợp lệ'));
        }

        if (user.role == "admin") {
            return next(createError(403, "Không thể đăng nhập bằng tài khoản admin"));
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(createError(401, 'Mật khẩu hoặc email không hợp lệ'));
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const getInfo = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Get current user info
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(createError(404, 'User not found'));
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};

// controllers/userController.js


// PUT /api/users/me
export const updateUserMe = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Chỉ cập nhật profile & một số trường cơ bản
        const {
            username,
            email,
            profile = {}
        } = req.body;

        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;

        // Nếu người dùng gửi profile
        const profileFields = ['firstName', 'lastName', 'bio', 'location', 'website', 'social', 'avatar'];
        for (const field of profileFields) {
            if (profile[field] !== undefined) {
                updates[`profile.${field}`] = profile[field];
            }
        }
        if (req.file) {
            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            updates['profile.avatar'] = imageUrl;
        } else if (profile.avatar) {
            // Nếu không upload file nhưng có trường avatar trong req.body
            updates['profile.avatar'] = profile.avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!updatedUser) {
            return next(createError(404, 'Không tìm thấy người dùng'));
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        next(createError(500, 'Cập nhật thông tin thất bại'));
    }
};

