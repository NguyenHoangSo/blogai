import mongoose from 'mongoose';

const AIPromptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    type: {
        type: String,
        enum: ['title', 'outline', 'content', 'summary', 'custom'],
        default: 'content'
    },
    promptConfig: {
        topic: { type: String, required: true },
        audience: { type: String },
        tone: { type: String },
        structure: [String],
        keywords: [String],
        length: { type: String }
    },
    promptText: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    modelUsed: {
        type: String,
        default: 'gpt-4o'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('AIPrompt', AIPromptSchema);