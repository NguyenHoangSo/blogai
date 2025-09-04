import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import savedPostsRoutes from './routes/savedPosts.js';
import cateRoutes from "./routes/categoryRoute.js";
import path from 'path';
import adminRoutes from "./routes/adminRoutes.js";
dotenv.config();

const app = express();

// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
}
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const __dirname = path.resolve(); // Lấy thư mục gốc
// Serve static with CORS headers
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    next();
}, express.static(path.join(__dirname, 'uploads')));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/saved-posts', savedPostsRoutes);
app.use('/api/categories', cateRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/bookmarks', bookmarkRoutes);


// Database connection
const DB_URI = process.env.MONGO_URI;

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
})
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        // Start the server only after database connection is established
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // Exit the process if database connection fails
    });



// Error handling
app.use(errorHandler);
