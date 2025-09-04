import express from 'express';
import { register, logout, refreshToken, forgotPassword, resetPassword } from '../controllers/authController.js';
import { login } from "../controllers/userController.js";
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
// router.use(protect);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

export default router; 