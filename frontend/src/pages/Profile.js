import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Avatar,
    Button,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    Paper,
    Badge,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, fetchUserPosts, fetchUserFavorites, updateUserAvatar, fetchLikedPosts, fetchComments, fetchReceivedComments } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
// import BookmarkIcon from '@mui/icons-material/Bookmark';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import ShareIcon from '@mui/icons-material/Share';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { vi } from 'date-fns/locale';
import { updateUserProfileAsync } from '../redux/slices/authSlice';


const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [comments, setComments] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const [profileData, favoritesData, commentsData] = await Promise.all([
                    fetchUserProfile(username),
                    fetchLikedPosts(),
                    fetchReceivedComments()  // API đã tạo để lấy bài viết user đã like
                ]);

                setProfile(profileData);
                setFavorites(favoritesData); // nếu response là mảng bài viết
                setComments(commentsData);
            } catch (error) {
                console.error('Error loading profile:', error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [username, navigate]);


    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFollow = async () => {
        // TODO: Implement follow functionality
        setIsFollowing(!isFollowing);
    };

    const handleAvatarClick = () => {
        if (isOwnProfile) {
            setAvatarDialogOpen(true);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // Kiểm tra loại file là ảnh
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP');
            return;
        }

        // Kiểm tra dung lượng (giới hạn 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB');
            return;
        }

        setSelectedFile(file);
    };


    const handleAvatarUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            const response = await updateUserAvatar(formData);
            if (response?.avatar) {
                const newAvatarUrl = response.avatar;
                setProfile((prev) => ({ ...prev, avatar: newAvatarUrl }));
                dispatch(updateUserProfileAsync({ ...currentUser, avatar: newAvatarUrl }));
            }

            setAvatarDialogOpen(false);
        } catch (error) {
            console.error('Error uploading avatar:', error);
        } finally {
            setUploading(false);
            setSelectedFile(null);
        }
    };

    const PostCard = ({ post }) => (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}
            onClick={() => navigate(`/post/${post._id}`)}
        >
            {post.image && (
                <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                    {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {post.excerpt}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                    <Chip
                        label={post.category?.name}
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
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profile) {
        return null;
    }

    const isOwnProfile = isAuthenticated && currentUser?.username === username;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Profile Header */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                isOwnProfile && (
                                    <IconButton
                                        size="small"
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }}
                                        onClick={handleAvatarClick}
                                    >
                                        <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                )
                            }
                        >
                            <Avatar
                                src={profile?.avatar}
                                alt={profile.username}
                                sx={{ width: 120, height: 120, cursor: isOwnProfile ? 'pointer' : 'default' }}
                                onClick={handleAvatarClick}
                            />

                        </Badge>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="h4" component="h1">
                                {profile.username}
                            </Typography>
                            {isOwnProfile ? (
                                <Button
                                    variant="outlined"
                                    startIcon={<EditIcon />}
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleFollow}
                                    sx={{ minWidth: 100 }}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                            )}
                        </Box>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {profile.bio || 'Không có sẵn tiểu sử'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                            <Typography variant="body2">
                                <strong>{profile.followersCount || 0}</strong> Người theo dõi
                            </Typography>
                            {/* <Typography variant="body2">
                                <strong>{profile.followingCount || 0}</strong> Đang theo dõi
                            </Typography> */}
                            <Typography variant="body2">
                                <strong>{posts.length}</strong> Danh sách
                            </Typography>
                            <Typography variant="body2">
                                <strong>{favorites.length}</strong> Yêu thích
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Danh sách" />
                    <Tab label="Yêu thích" />
                    <Tab label="Phản hồi" />
                </Tabs>
            </Box>

            {/* Content */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {posts.map((post) => (
                        <Grid item xs={12} md={6} key={post._id}>
                            <PostCard post={post} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {favorites.map((post) => (
                        <Grid item xs={12} md={6} key={post._id}>
                            <PostCard post={post} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {activeTab === 2 && (
                <Box sx={{ py: 2 }}>
                    {comments.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            Chưa có phản hồi nào cho bài viết của bạn.
                        </Typography>
                    ) : (
                        comments.map((comment) => (
                            <Paper key={comment._id} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {comment.author?.username} bình luận về bài viết:{' '}
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigate(`/post/${comment.post?.slug}`)}
                                    >
                                        {comment.post?.title}
                                    </Button>
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                    {comment.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                </Typography>
                            </Paper>
                        ))
                    )}
                </Box>
            )}


            {/* Avatar Upload Dialog */}
            <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
                <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar"
                            name="avatar"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="avatar">
                            <Button
                                variant="contained"
                                component="span"
                                disabled={uploading}
                            >
                                Chọn ảnh
                            </Button>
                        </label>
                        {selectedFile && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2">Xem trước:</Typography>
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            </Box>
                        )}
                        {selectedFile && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                {selectedFile.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAvatarDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleAvatarUpload}
                        disabled={!selectedFile || uploading}
                        variant="contained"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile; 