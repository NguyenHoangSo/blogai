import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createError } from '../utils/error.js';

// Register new user
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return next(createError(400, 'Username or email already exists'));
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(201).json({
            status: 'success',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(createError(401, 'Invalid credentials'));
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(createError(401, 'Invalid credentials'));
        }
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Bạn không có quyền truy cập trang admin.' });
        }
        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            status: 'success',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// Logout user
export const logout = async (req, res, next) => {
    try {
        // In a real application, you might want to invalidate the token
        // For now, we'll just send a success response
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
    try {
        const user = req.user;

        // Generate new token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return next(createError(404, 'No user found with that email'));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // In a real application, you would send an email with the reset token
        // For development, we'll just send it in the response
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
            resetToken // Remove this in production
        });
    } catch (error) {
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with token and check if token hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(createError(400, 'Token is invalid or has expired'));
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Generate new token
        const newToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: 'success',
            data: {
                token: newToken
            }
        });
    } catch (error) {
        next(error);
    }
}; 