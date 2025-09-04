import express from 'express';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    login,
    getInfo,
    getMe,
    updateUserMe
} from '../controllers/userController.js';
import { verifyToken, verifyAdmin, verifyUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', createUser);
router.post('/login', login);

router.post('/me', verifyToken, upload.single('avatar'), updateUserMe);
router.post('/avatar', verifyToken, upload.single('avatar'), updateUserMe);
// Protected routes
router.get('/me', verifyToken, getMe);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/profile/:username', getInfo);

export default router; 