import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Container, Typography, Box, Paper, Avatar, Chip, Button, IconButton,
    Menu, MenuItem, Divider, Skeleton, Alert, Fab, Tooltip
} from '@mui/material';
import {
    Share, Bookmark, BookmarkBorder, Favorite, FavoriteBorder, MoreVert,
    Edit, Delete, ArrowBack, Comment, Visibility
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    fetchPostById, fetchComments, comment,
    deleteComment, savePost,
    increaseView,
    getCateById,
    likePost
} from '../services/api';
import '../styles/NotionEditor.css';
import CommentInput from '../components/Comment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "react-markdown";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { Snackbar } from '@mui/material';



const Post = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState(null);
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [cate, setCate] = useState('');

    const fetchPost = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetchPostById(id);
            setPost(response);
            if (isAuthenticated && response) {
                setIsBookmarked(response.engagement?.bookmarks?.includes(user._id));
                setIsLiked(response.engagement?.likes?.includes(user._id));
            }
        } catch (err) {
            setError('Không thể tải bài viết');
            console.error('Lỗi khi tải bài viết:', err);
        } finally {
            setLoading(false);
        }
    }, [id, isAuthenticated, user]);

    useEffect(() => {
        const viewKey = `viewed_post_${id}`;
        const lastViewed = localStorage.getItem(viewKey);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;

        if (!lastViewed || now - parseInt(lastViewed) > tenMinutes) {
            const increased = async () => {
                try {
                    await increaseView(id)
                    localStorage.setItem(viewKey, now.toString());
                } catch (error) {
                    console.log(error)
                }
            }
            increased();
        }
    }, [id]);

    useEffect(() => {
        if (!post || !user) return;
        if (Array.isArray(post.likes)) {
            setIsLiked(post.likes.includes(user._id));
        }
    }, [post, user]);




    const loadComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const response = await fetchComments(id);
            setComments(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
        } finally {
            setLoadingComments(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    useEffect(() => {
        if (showComments) loadComments();
    }, [showComments, loadComments]);

    const handleSubmitComment = async (commentText) => {
        if (!isAuthenticated) return navigate('/login');
        setIsSubmitting(true);
        try {
            const response = await comment(id, commentText);
            const newComment = {
                ...response.data.comment,
                createdAt: new Date().toISOString(),
                author: {
                    _id: user._id,
                    username: user.username,
                    profile: { avatar: user.profile?.avatar }
                }
            };
            setComments((prev) => [newComment, ...prev]);
        } catch (err) {
            console.error('Lỗi khi gửi bình luận:', err);
        } finally {
            setIsSubmitting(false);
        }

    };

    const isAuthor = isAuthenticated && user && post && user._id === post.author?._id;

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleClickShowComment = () => setShowComments(!showComments);
    const handleBookmark = async () => {
        if (!isAuthenticated) return navigate('/login');

        try {
            const newStatus = !isBookmarked;
            setIsBookmarked(newStatus);
            await savePost(post._id);
            setSnackbarMessage(newStatus ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Lỗi khi lưu bài viết:', error);
            alert('Không thể lưu bài viết.');
            setIsBookmarked((prev) => !prev); // rollback
        }
    };
    const handleLike = async () => {
        if (!isAuthenticated) return navigate('/login');
        try {
            const res = await likePost(id); // response trả về { liked: true/false, likesCount, likes }
            console.log(res)
            setIsLiked(res.liked);

            setPost(prev => ({
                ...prev,
                stats: {
                    ...(prev.stats || {}), // 🔥 thêm fallback nếu stats chưa tồn tại
                    likesCount: res.likesCount
                },
                likes: res.likes
            }));
        } catch (error) {
            console.log('Lỗi khi thích bài viết:', error);
        }
    };

    const handleEdit = () => { navigate(`/edit/${post._id}`); handleMenuClose(); };
    const handleDelete = () => { if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) navigate('/dashboard'); handleMenuClose(); };

    const handleCommentMenuOpen = (event, commentId) => {
        setCommentMenuAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleCommentMenuClose = () => {
        setCommentMenuAnchorEl(null);
        setSelectedCommentId(null);
    };

    const handleDeleteSelectedComment = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        try {
            await deleteComment(selectedCommentId);
            setComments((prev) => prev.filter((c) => c._id !== selectedCommentId));
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            alert('Không thể xóa bình luận');
        } finally {
            handleCommentMenuClose();
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
            } else {
                navigator.clipboard.writeText(window.location.href);
            }
        } catch (err) {
            console.log('Lỗi khi chia sẻ:', err);
        } finally {
            setIsSubmitting(false);
        }
        handleMenuClose();
    };
    useEffect(() => {
        const getNameOfCate = async (id) => {
            try {
                const res = await getCateById(id);
                setCate(res.name);
            } catch (error) {
                console.log(error);
            }

        }

        getNameOfCate(post?.category);
    }, [post?.category])



    const renderFormattedText = (text) => {
        const escapeAsterisks = (t) => t.replace(/\\\*/g, '&#42;');

        const lines = text.split('\n');
        const elements = [];
        let orderedList = [];
        let unorderedList = [];

        const flushLists = () => {
            if (orderedList.length > 0) {
                elements.push(
                    <Box
                        component="ol"
                        sx={{
                            pl: 3,
                            color: 'text.primary',
                            '& li': { mb: 1.5 },
                        }}
                        key={`ol-${elements.length}`}
                    >
                        {orderedList.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </Box>
                );
                orderedList = [];
            }
            if (unorderedList.length > 0) {
                elements.push(
                    <Box
                        component="ul"
                        sx={{
                            pl: 3,
                            color: 'text.primary',
                            '& li::marker': { color: 'primary.main' },
                            '& li': { mb: 1.5 },
                        }}
                        key={`ul-${elements.length}`}
                    >
                        {unorderedList.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </Box>
                );
                unorderedList = [];
            }
        };

        const formatText = (raw) => {
            return escapeAsterisks(raw)
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e88e5">$1</strong>') // blue bold
                .replace(/\*(.*?)\*/g, '<em style="color:#6d4c41">$1</em>'); // brown italic
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (trimmed === '') {
                flushLists();
                elements.push(<Box key={`br-${index}`} sx={{ height: 10 }} />);
                return;
            }

            if (trimmed.startsWith('### ')) {
                flushLists();
                elements.push(
                    <Typography
                        key={index}
                        variant="h6"
                        sx={{ mt: 3, fontWeight: 700, color: 'primary.dark' }}
                    >
                        {trimmed.replace(/^### /, '')}
                    </Typography>
                );
                return;
            }

            if (trimmed.startsWith('## ')) {
                flushLists();
                elements.push(
                    <Typography
                        key={index}
                        variant="h5"
                        sx={{ mt: 4, fontWeight: 800, color: 'secondary.main' }}
                    >
                        {trimmed.replace(/^## /, '')}
                    </Typography>
                );
                return;
            }

            if (trimmed.startsWith('<p>') && trimmed.endsWith('</p>')) {
                flushLists();
                const inner = trimmed.replace(/^<p>/, '').replace(/<\/p>$/, '');
                const formatted = formatText(inner);
                elements.push(
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{ mb: 1.5, color: 'text.secondary', lineHeight: 1.8 }}
                        dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                );
                return;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                const clean = trimmed.replace(/^\d+\.\s+/, '');
                orderedList.push(formatText(clean));
                return;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                const clean = trimmed.replace(/^[-*]\s+/, '');
                unorderedList.push(formatText(clean));
                return;
            }

            flushLists();
            const formatted = formatText(trimmed);
            elements.push(
                <Typography
                    key={index}
                    variant="body1"
                    sx={{ mb: 1.5, color: 'text.primary', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
        });

        flushLists();
        return elements;
    };

    if (loading) return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Skeleton variant="text" width="80%" height={60} />
            <Box sx={{ display: 'flex', gap: 2, my: 3 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="30%" />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={200} />
        </Container>
    );

    if (error) return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>Quay lại</Button>
        </Container>
    );

    if (!post) return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Alert severity="info">Không tìm thấy bài viết</Alert>
            <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>Quay lại</Button>
        </Container>
    );

    return (

        <>
            <Container maxWidth="md" sx={{ py: 4, position: 'relative' }}>
                <Fab size="small" onClick={() => navigate(-1)} sx={{ position: 'fixed', top: 100, left: 20, zIndex: 1000 }}>
                    <ArrowBack />
                </Fab>

                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>{post.title}</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={post?.author?.profile?.avatar} alt={post?.author?.username} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{post.author?.username}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={isLiked ? 'Bỏ thích' : 'Thích'}>
                            <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
                                {isLiked ? <Favorite /> : <FavoriteBorder />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}>
                            <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
                                {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                            </IconButton>
                        </Tooltip>
                        {/* <Tooltip title="Chia sẻ">
                            <IconButton onClick={handleShare}><Share /></IconButton>
                        </Tooltip> */}
                        <IconButton onClick={handleMenuClick}><MoreVert /></IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {isAuthor && [
                                <MenuItem key="edit" onClick={handleEdit}><Edit sx={{ mr: 1 }} fontSize="small" />Chỉnh sửa</MenuItem>,
                                <MenuItem key="delete" onClick={handleDelete} sx={{ color: 'error.main' }}><Delete sx={{ mr: 1 }} fontSize="small" />Xóa bài</MenuItem>,
                                <Divider key="divider" />
                            ]}
                            <MenuItem onClick={handleShare}><Share sx={{ mr: 1 }} fontSize="small" />Chia sẻ</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={cate} color="primary" variant="outlined" />
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility fontSize="small" />{post?.views || 0} lượt xem
                    </Typography>
                    <Typography variant="body2">{post.stats?.readingTime || 5} phút đọc</Typography>
                    {post.tags?.slice(0, 3).map((tag, index) => (
                        <Chip key={index} label={`#${tag}`} size="small" variant="outlined" />
                    ))}
                </Box>

                {post.coverImage && post.coverImage !== '/default-post.jpg' && (
                    <Box sx={{ mb: 4 }}>
                        <img src={post.coverImage} alt={post.title} style={{ width: '100%', borderRadius: '12px' }} />
                    </Box>
                )}

                <Paper elevation={0} sx={{ mb: 4, bgcolor: 'transparent' }}>
                    {renderFormattedText(post.content)}
                </Paper>
                {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
            </ReactMarkdown> */}




                <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Tương tác với bài đăng</Typography>
                        <Button startIcon={<Comment />} onClick={handleClickShowComment} variant={showComments ? 'contained' : 'outlined'}>
                            {!showComments ? 'Xem bình luận' : `Đã bình luận ${comments.length}`}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button startIcon={isLiked ? <Favorite /> : <FavoriteBorder />} onClick={handleLike} variant={isLiked ? 'contained' : 'outlined'} color={isLiked ? 'error' : 'primary'}>
                            {post.stats?.likesCount || 0} Thích
                        </Button>
                        <Button startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />} onClick={handleBookmark} variant={isBookmarked ? 'contained' : 'outlined'}>
                            {isBookmarked ? 'Đã đánh dấu' : 'Đánh dấu'}
                        </Button>
                        {/* <Button startIcon={<Share />} onClick={handleShare} variant="outlined">Chia sẻ</Button> */}
                    </Box>
                </Paper>

                {showComments && (
                    <Paper sx={{ p: 3, mt: 2 }}>
                        <CommentInput user={user} onSubmit={handleSubmitComment} isSubmitting={isSubmitting} />

                        {loadingComments ? (
                            <Box sx={{ mt: 2 }}>
                                <Skeleton height={40} />
                                <Skeleton height={40} />
                            </Box>
                        ) : comments.length === 0 ? (
                            <Typography variant="body2" sx={{ mt: 2 }}>Chưa có bình luận nào.</Typography>
                        ) : (
                            <Box sx={{ mt: 2, position: 'relative' }}>
                                {comments.map((cmt) => {
                                    const isCommentAuthor = user?._id === cmt.author?._id;
                                    return (
                                        <Box
                                            key={cmt._id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 2,
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'grey.100',
                                                position: 'relative',
                                            }}
                                        >
                                            <Avatar
                                                src={cmt.author?.profile?.avatar}
                                                alt={cmt.author?.username}
                                                sx={{ width: 40, height: 40 }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {cmt.author?.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {cmt.createdAt
                                                            ? formatDistanceToNow(new Date(cmt.createdAt), { addSuffix: true, locale: vi })
                                                            : 'Vừa đăng'}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 0.5, whiteSpace: 'pre-wrap', color: 'text.primary' }}
                                                >
                                                    {cmt.content}
                                                </Typography>
                                            </Box>

                                            {isCommentAuthor && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(event) => handleCommentMenuOpen(event, cmt._id)}
                                                    sx={{ position: 'absolute', bottom: 8, right: 8, color: 'text.secondary' }}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>

                                            )}
                                            <Menu
                                                anchorEl={commentMenuAnchorEl}
                                                open={Boolean(commentMenuAnchorEl)}
                                                onClose={handleCommentMenuClose}
                                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                            >
                                                <MenuItem onClick={handleDeleteSelectedComment}>
                                                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Xóa bình luận
                                                </MenuItem>
                                            </Menu>

                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Paper>
                )}

            </Container>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </>
    );
};

export default Post;
