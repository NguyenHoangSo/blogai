import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    savedPosts: [],
    loading: false,
    error: null
};

const savedPostsSlice = createSlice({
    name: 'savedPosts',
    initialState,
    reducers: {
        setSavedPosts: (state, action) => {
            // Ensure we always have an array
            const posts = action.payload?.posts || action.payload || [];
            state.savedPosts = Array.isArray(posts) ? posts : [];
            state.loading = false;
            state.error = null;
        },
        addSavedPost: (state, action) => {
            const post = action.payload?.post || action.payload;
            if (!post) return;

            // Ensure savedPosts is an array
            if (!Array.isArray(state.savedPosts)) {
                state.savedPosts = [];
            }

            // Check if post already exists
            const exists = state.savedPosts.some(p => p._id === post._id);
            if (!exists) {
                state.savedPosts = [post, ...state.savedPosts];
            }
        },
        removeSavedPost: (state, action) => {
            const postId = action.payload?.postId || action.payload;
            if (!postId) return;

            // Ensure savedPosts is an array
            if (!Array.isArray(state.savedPosts)) {
                state.savedPosts = [];
                return;
            }

            state.savedPosts = state.savedPosts.filter(post => post._id !== postId);
        },
        setLoading: (state, action) => {
            state.loading = Boolean(action.payload);
        },
        setError: (state, action) => {
            state.error = action.payload || null;
            state.loading = false;
        }
    }
});

export const {
    setSavedPosts,
    addSavedPost,
    removeSavedPost,
    setLoading,
    setError
} = savedPostsSlice.actions;

export default savedPostsSlice.reducer; 