import express from 'express';
import { verifyAdmin, verifyToken } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { generateBlogFromAI, generateTitleFromAI, getAllAiPrompts } from '../controllers/aiPrompt.js';

const router = express.Router();

// Generate blog post
router.post('/generate-post', verifyToken, generateBlogFromAI);

// Generate title
router.post('/generate-title', verifyToken, generateTitleFromAI);

// Generate blog ideas
router.post('/generate-ideas', verifyToken, async (req, res, next) => {
    try {
        const { topic, count } = req.body;
        const result = await aiService.generateBlogIdeas(topic, count);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Optimize SEO
router.post('/optimize-seo', verifyToken, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const result = await aiService.optimizeSEO(title, content);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/', verifyToken, verifyAdmin, getAllAiPrompts);

export default router; 