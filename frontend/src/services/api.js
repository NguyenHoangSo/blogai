import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Posts API
export const fetchPosts = async ({ page = 1, search = '', category = '' }) => {
    const response = await api.get('/posts', {
        params: { page, search, category }
    });
    return response.data;
};

export const fetchFeaturedPosts = async () => {
    const response = await api.get('/posts/featured');
    return response.data;
};

export const fetchPostBySlug = async (slug) => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
};

export const fetchPostById = async (id) => {
    const response = await api.get(`/posts/post/${id}`);
    return response.data;
};


export const createPost = async (postData) => {
    const response = await api.post('/posts/post', postData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    return response.data;
};
export const draftPost = async (postData) => {
    const response = await api.post('/posts', postData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    return response.data;
};

export const updatePost = async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
};

export const deletePost = async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
};

export const increaseView = async (id) => {
    const response = await api.patch(`/posts/post/${id}`)
    return response.data;
}

// User API
export const register = async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
};

export const loginAdmin = async (credentials) => {
    const response = await api.post('/admin/login', credentials)
    return response.data;
}

export const getCurrentUser = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await api.post('/users/me', userData);
    return response.data;
};

// AI API
export const generatePost = async (config) => {
    const response = await api.post('/ai/generate-post', config);
    return response.data;
};

export const generateTitle = async (content) => {
    try {
        const response = await api.post('/ai/generate-title', { content });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể tạo tiêu đề' };
    }
};

export const fetchComments = async (postId) => {
    const response = await api.get(`/comments/post/${postId}`)
    return response.data;
}

export const comment = async (postId, content) => {
    const response = await api.post('/comments', { postId, content })
    return response.data;
}

export const deleteComment = async (commetId) => {
    const response = await api.delete(`/comments/${commetId}`);
    return response;
}

export const generateIdeas = async (topic, count = 5) => {
    const response = await api.post('/ai/generate-ideas', { topic, count });
    return response.data;
};

export const optimizeSEO = async (title, content) => {
    const response = await api.post('/ai/optimize-seo', { title, content });
    return response.data;
};

// User Profile API
export const fetchUserProfile = async (username) => {
    const response = await api.get(`/users/profile/${username}`, {
        headers: {
            'Cache-Control': 'no-cache'
        }
    });
    return response.data;
};

export const fetchUserPosts = async (username) => {
    const response = await api.get(`/users/${username}/posts`);
    return response.data;
};

export const fetchUserFavorites = async (username) => {
    const response = await api.get(`/users/${username}/favorites`);
    return response.data;
};

export const fetchLikedPosts = async () => {
    const response = await api.get('/posts/liked');
    return response.data; // hoặc response.data.posts nếu bạn bọc trong object
};


export const updateUserAvatar = async (formData) => {
    const response = await api.post('/users/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const followUser = async (username) => {
    const response = await api.post(`/users/follow/${username}`);
    return response.data;
};

export const unfollowUser = async (username) => {
    const response = await api.post(`/users/unfollow/${username}`);
    return response.data;
};

// Saved Posts APIs
export const fetchSavedPosts = async () => {
    try {
        const response = await api.get('/saved-posts/saved');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể tải danh sách bài viết đã lưu' };
    }
};

export const savePost = async (postId) => {
    try {
        const response = await api.post(`/saved-posts/${postId}/save`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể lưu bài viết' };
    }
};

export const getPostsByStatus = async (status) => {
    const res = await axios.get(`/api/posts?status=${status}`);
    return res.data;
};


export const fetchSavedList = async () => {
    const response = await api.get('saved-posts/saved')
    return response.data;
}

export const unsavePost = async (postId) => {
    try {
        const response = await api.post(`/saved-posts/${postId}/unsave`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Không thể bỏ lưu bài viết' };
    }
};

export const getCategories = async () => {
    const response = await api.get('/categories')
    return response.data;
}

export const getCateById = async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data;
}

export const likePost = async (id) => {
    const response = await api.put(`/posts/${id}/like`)
    return response.data
}

export const fetchReceivedComments = async () => {
    const response = await api.get('/comments/received');
    return response.data;
};