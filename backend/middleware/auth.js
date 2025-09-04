import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
import User from '../models/user.js';

export const verifyToken = async (req, res, next) => {
    try {
        // 1) Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(createError(401, 'You are not logged in. Please log in to get access.'));
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(createError(401, 'The user belonging to this token no longer exists.'));
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(createError(401, 'Invalid token. Please log in again.'));
        }
        if (error.name === 'TokenExpiredError') {
            return next(createError(401, 'Your token has expired. Please log in again.'));
        }
        next(error);
    }
};

export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return next(createError(403, 'You are not authorized to perform this action'));
        }
    });
};

export const verifyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === 'user') {
            next();
        } else {
            return next(createError(403, 'You are not authorized to perform this action'));
        }
    });
};

export const verifyModerator = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'moderator' || req.user.role === 'admin') {
            next();
        } else {
            return next(createError(403, 'You are not authorized to perform this action'));
        }
    });
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(createError(403, 'You do not have permission to perform this action'));
        }
        next();
    };
};

export const isAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
}; 