import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { getCateById, savePost, unsavePost } from '../services/api';
import { useSelector } from 'react-redux';
import { vi } from 'date-fns/locale';

const PostCard = ({ post, onSaveChange }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isSaved, setIsSaved] = useState(post.isSaved || false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [cateName, setCateName] = useState('');


    useEffect(() => {
        const getNameCate = async () => {
            try {
                const res = await getCateById(post.category);
                setCateName(res.name)
            } catch (error) {
                console.log(error)
            }
        }
        getNameCate();
    }, [post.category])


    const handleSaveClick = async (e) => {
        e.stopPropagation(); // Prevent card click event
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để lưu bài viết',
                severity: 'warning'
            });
            return;
        }

        try {
            if (isSaved) {
                await unsavePost(post._id);
                setIsSaved(false);
                setSnackbar({
                    open: true,
                    message: 'Đã bỏ lưu bài viết',
                    severity: 'success'
                });
            } else {
                await savePost(post._id);
                setIsSaved(true);
                setSnackbar({
                    open: true,
                    message: 'Đã lưu bài viết',
                    severity: 'success'
                });
            }
            if (onSaveChange) {
                onSaveChange(post._id, !isSaved);
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || 'Có lỗi xảy ra',
                severity: 'error'
            });
        }
    };

    const handleCardClick = () => {
        navigate(`/post/${post._id}`);
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                    }
                }}
                onClick={handleCardClick}
            >
                {post.coverImage && (
                    <CardMedia
                        component="img"
                        height="200"
                        image={post.coverImage || '/default-post.jpg'}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                    />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            {post.title}
                        </Typography>
                        <Tooltip title={isSaved ? "Bỏ lưu" : "Lưu bài viết"}>
                            <IconButton
                                size="small"
                                onClick={handleSaveClick}
                                sx={{
                                    color: isSaved ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        color: isSaved ? 'primary.dark' : 'primary.main'
                                    }
                                }}
                            >
                                {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {post.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                        <Chip
                            label={cateName}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default PostCard; 