import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, CssBaseline, Box, Drawer,
    IconButton, List, ListItem, ListItemText, Table, TableHead, TableRow,
    TableCell, TableBody, Chip, CircularProgress, Select, MenuItem,
    Paper, Tooltip, Divider, useTheme, useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import CommentIcon from '@mui/icons-material/Comment';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';

import axios from 'axios';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice'; // đảm bảo đúng đường dẫn
import { deletePost, deleteComment } from '../services/api';



const drawerWidth = 240;

const Admin = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [view, setView] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [aiLogs, setAiLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletePostId, setDeletePostId] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [selectedCommentId, setSelectedCommentId] = useState(null);


    const dispatch = useDispatch();


    const token = localStorage.getItem('token');

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const fetchPosts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/posts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data.posts);
        } catch (err) {
            console.error('Lỗi tải bài viết:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Lỗi tải người dùng:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/comments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(res.data.data);
        } catch (err) {
            console.error('Lỗi tải bình luận:', err);
        }
    };


    const fetchAiLogs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ai', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAiLogs(res.data.data);
        } catch (err) {
            console.error('Lỗi tải lịch sử AI:', err);
        }
    };

    const handleDeletePost = async (id) => {
        if (!id) return;
        try {
            await deletePost(id)
            setDeletePostId(null);
            fetchPosts();
        } catch (err) {
            console.error('Lỗi xóa bài viết:', err);
        }
    };


    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        window.location.href = '/'; // hoặc dùng navigate('/') nếu bạn có hook useNavigate
    };


    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(
                `http://localhost:5000/api/users/${userId}`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (err) {
            console.error('Lỗi cập nhật vai trò:', err);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (view === 'posts') fetchPosts().then(() => setLoading(false));
        else if (view === 'users') fetchUsers().then(() => setLoading(false));
        else if (view === 'comments') fetchComments().then(() => setLoading(false));
        else if (view === 'aiLogs') fetchAiLogs().then(() => setLoading(false));
    }, [view]);

    const drawer = (
        <Box>
            <Toolbar />
            <Divider />
            <List>
                <ListItem
                    button
                    selected={view === 'posts'}
                    onClick={() => {
                        setView('posts');
                        setMobileOpen(false);
                    }}
                    sx={{
                        '&.Mui-selected': {
                            bgcolor: '#e3f2fd',
                            borderLeft: '4px solid #1976d2'
                        }
                    }}
                >
                    <ArticleIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Quản lý Bài viết" />
                </ListItem>
                <ListItem
                    button
                    selected={view === 'users'}
                    onClick={() => {
                        setView('users');
                        setMobileOpen(false);
                    }}
                    sx={{
                        '&.Mui-selected': {
                            bgcolor: '#e3f2fd',
                            borderLeft: '4px solid #1976d2'
                        }
                    }}
                >
                    <PeopleIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Quản lý Người dùng" />
                </ListItem>
                <ListItem
                    button
                    selected={view === 'comments'}
                    onClick={() => {
                        setView('comments');
                        setMobileOpen(false);
                    }}
                    sx={{
                        '&.Mui-selected': {
                            bgcolor: '#e3f2fd',
                            borderLeft: '4px solid #1976d2'
                        }
                    }}
                >
                    <CommentIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Quản lý Bình luận" />
                </ListItem>

                <ListItem
                    button
                    selected={view === 'aiLogs'}
                    onClick={() => {
                        setView('aiLogs');
                        setMobileOpen(false);
                    }}
                    sx={{
                        '&.Mui-selected': {
                            bgcolor: '#e3f2fd',
                            borderLeft: '4px solid #1976d2'
                        }
                    }}
                >
                    <HistoryEduIcon sx={{ mr: 1 }} />
                    <ListItemText primary="Lịch sử sử dụng AI" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ bgcolor: '#1976d2', zIndex: 1300 }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" noWrap component="div" fontWeight={600}>
                        Bảng Điều Khiển Quản Trị
                    </Typography>
                    <Tooltip title="Đăng xuất">
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box'
                        }
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8
                }}
            >
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    {view === 'posts'
                        ? 'Quản lý Bài viết'
                        : view === 'users'
                            ? 'Quản lý Người dùng' :
                            view === 'comments' ?
                                'Quản lý Bình luận'
                                : 'Lịch sử sử dụng AI'}
                </Typography>

                <Paper
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                        p: 2,
                        overflowX: 'auto',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={6}>
                            <CircularProgress />
                        </Box>
                    ) : view === 'posts' ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Tiêu đề</strong></TableCell>
                                    <TableCell><strong>Trạng thái</strong></TableCell>
                                    <TableCell><strong>AI?</strong></TableCell>
                                    <TableCell><strong>Ngày đăng</strong></TableCell>
                                    <TableCell><strong>Hành động</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post._id}>
                                        <TableCell>{post.title}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={post.status === 'published' ? 'Đã đăng' : 'Nháp'}
                                                color={post.status === 'published' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {post.isAIGenerated ? (
                                                <Tooltip title="Bài viết do AI tạo">
                                                    <Chip label="AI" color="info" size="small" />
                                                </Tooltip>
                                            ) : (
                                                <Chip label="Tự viết" color="default" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedPostId(post._id);
                                                    setConfirmDialogOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : view === 'users' ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Vai trò</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(user._id, e.target.value)
                                                }
                                                size="small"
                                            >
                                                <MenuItem value="admin">admin</MenuItem>
                                                <MenuItem value="user">user</MenuItem>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : view === 'comments' ? (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Bài viết</strong></TableCell>
                                    <TableCell><strong>Người dùng</strong></TableCell>
                                    <TableCell><strong>Nội dung</strong></TableCell>
                                    <TableCell><strong>Thời gian</strong></TableCell>
                                    <TableCell><strong>Hành động</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comments.map((comment) => (
                                    <TableRow key={comment._id}>
                                        <TableCell>{comment.post?.title || '---'}</TableCell>
                                        <TableCell>{comment.author?.email || '---'}</TableCell>
                                        <TableCell>{comment.content}</TableCell>
                                        <TableCell>{new Date(comment.createdAt).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedCommentId(comment._id);
                                                    setConfirmDialogOpen(true);
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )
                        : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Người dùng</strong></TableCell>
                                        <TableCell><strong>Loại yêu cầu</strong></TableCell>
                                        <TableCell><strong>Prompt</strong></TableCell>
                                        <TableCell><strong>Phản hồi AI</strong></TableCell>
                                        <TableCell><strong>Mô hình</strong></TableCell>
                                        <TableCell><strong>Thời gian</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aiLogs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell>{log.userId?.email || 'Không xác định'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.type}
                                                    size="small"
                                                    color={
                                                        log.type === 'content' ? 'info' :
                                                            log.type === 'title' ? 'success' : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={log?.promptText} arrow>
                                                    <Typography noWrap sx={{ maxWidth: 200 }}>
                                                        {log.promptConfig?.promptText || '---'}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={log.aiResponse} arrow>
                                                    <Typography noWrap sx={{ maxWidth: 200 }}>
                                                        {log.aiResponse || '---'}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{log.modelUsed || '---'}</TableCell>
                                            <TableCell>
                                                {new Date(log.createdAt).toLocaleString('vi-VN')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                        )}
                </Paper>
                <Dialog
                    open={confirmDialogOpen}
                    onClose={() => setConfirmDialogOpen(false)}
                >
                    <Paper sx={{ p: 2, minWidth: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Xác nhận xóa bài viết
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={async () => {
                                    try {
                                        if (view === 'posts' && selectedPostId) {
                                            await deletePost(selectedPostId);
                                            await fetchPosts();
                                            setSelectedPostId(null);
                                        } else if (view === 'comments' && selectedCommentId) {
                                            await deleteComment(selectedCommentId);
                                            await fetchComments();
                                            setSelectedCommentId(null);
                                        }
                                    } catch (err) {
                                        console.error('Lỗi khi xóa:', err);
                                    } finally {
                                        setConfirmDialogOpen(false);
                                    }
                                }}
                            >
                                Xóa
                            </Button>
                        </Box>
                    </Paper>
                </Dialog>

            </Box>
        </Box>
    );
};

export default Admin;
