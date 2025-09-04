import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import { fetchSavedPosts } from '../services/api';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const SavedPostsList = () => {
    const navigate = useNavigate();
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSavedPosts();
    }, []);

    const loadSavedPosts = async () => {
        try {
            setLoading(true);
            const response = await fetchSavedPosts();
            console.log(response)
            setSavedPosts(response.posts || []);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách bài viết đã lưu');
            console.error('Lỗi khi tải bài viết đã lưu:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveChange = (postId, isSaved) => {
        setSavedPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (savedPosts.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <BookmarkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Chưa có bài viết nào được lưu
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Khi bạn lưu bài viết, chúng sẽ xuất hiện ở đây
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/')}
                >
                    Khám Phá Bài Viết
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Bài Viết Đã Lưu
                </Typography>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/profile/saved')}
                >
                    Xem Tất Cả
                </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
                {savedPosts.slice(0, 4).map((post) => (
                    <Grid item xs={12} md={6} key={post._id}>
                        <PostCard post={post} onSaveChange={handleSaveChange} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SavedPostsList; 