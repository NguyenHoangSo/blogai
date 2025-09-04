import mongoose from "mongoose";
import AiPrompt from "../models/AiPrompt.js";
import { aiService } from "../services/aiService.js";
import { createError } from "../utils/error.js";
export const generateBlogFromAI = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.body.userId;
        const {
            topic,
            audience,
            tone = 'professional',
            structure = ['Introduction', 'Main content', 'Conclusion'],
            keywords = [],
            length = '1000 words',
            postId,
        } = req.body;
        if (!topic) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        const aiResult = await aiService.generateBlogPost({
            topic,
            audience,
            tone,
            structure,
            keywords,
            length
        });

        const promptDoc = await AiPrompt.create({
            userId: new mongoose.Types.ObjectId(userId),
            postId: postId ? new mongoose.Types.ObjectId(postId) : undefined,
            type: 'content',
            promptConfig: { topic, audience, tone, structure, keywords, length },
            promptText: aiResult.prompt,
            aiResponse: aiResult.content,
            modelUsed: aiResult.model
        });

        res.status(201).json({
            success: true,
            content: aiResult.content,
            promptId: promptDoc._id
        });
    } catch (err) {
        next(err);
    }
};

export const generateTitleFromAI = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.body.userId;
        const { content, postId } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Topic is required' });
        }

        if (typeof content !== 'string') {
            throw new Error("content must be string!");
        }

        const aiResult = await aiService.generateTitle(content);

        const promptDoc = await AiPrompt.create({
            userId: new mongoose.Types.ObjectId(userId),
            postId: postId ? new mongoose.Types.ObjectId(postId) : undefined,
            type: 'title',
            promptConfig: { topic: content },
            promptText: content,
            aiResponse: aiResult.titles.join('\n'),
            modelUsed: aiResult.model
        });

        res.status(201).json({
            success: true,
            content: aiResult.titles,
            promptId: promptDoc._id
        });
    } catch (err) {
        next(err);
    }
};

export const getAllAiPrompts = async (req, res, next) => {
    try {
        const aiPrompts = await AiPrompt.find()
            .populate({ path: 'userId', select: 'email', strictPopulate: false })
            .sort({ createAt: 0 })
            .lean();
        res.status(200).json({
            status: true,
            data: aiPrompts,
            message: "success"
        })
    } catch (error) {
        next(error)
    }
}