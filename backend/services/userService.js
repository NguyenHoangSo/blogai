import User from '../models/user.js';
import { createError } from '../utils/error.js';

export const userService = {
    // Find user by email
    async findByEmail(email) {
        return await User.findOne({ email });
    },

    // Find user by username
    async findByUsername(username) {
        return await User.findOne({ username });
    },

    // Update user profile
    async updateProfile(userId, updateData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            throw createError(404, 'User not found');
        }
        return user;
    },

    // Change password
    async changePassword(userId, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw createError(404, 'User not found');
        }

        user.password = newPassword;
        await user.save();
        return { message: 'Password updated successfully' };
    },

    // Deactivate account
    async deactivateAccount(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            throw createError(404, 'User not found');
        }
        return { message: 'Account deactivated successfully' };
    }
}; 