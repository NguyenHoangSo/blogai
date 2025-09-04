import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Box,
    Container,
    Chip,
    Badge,
    Tooltip,
    Fade,
    useScrollTrigger,
    Slide
} from '@mui/material';
import {
    Create as CreateIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Dashboard as DashboardIcon,
    Bookmark as BookmarkIcon,
    Menu as MenuIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUser, updateUserProfileAsync } from '../redux/slices/authSlice';
import Logo from './Logo';
import './Navbar.css';
import { updateUserAvatar, updateUserProfile } from '../services/api';

// Hide on scroll component
function HideOnScroll({ children }) {
    const trigger = useScrollTrigger();
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);

    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const username = useSelector((state) => state.auth.user?.username || "testuser");

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/');
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const isActive = (path) => location.pathname === path;

    const navigationItems = [
        { label: 'Trang chủ', path: '/', icon: <HomeIcon /> },
        { label: 'Về chúng tôi', path: '/about', icon: <InfoIcon /> },
    ];

    if (user?.role === 'admin') return (<></>);


    return (
        <>
            <HideOnScroll>
                <AppBar
                    position="fixed"
                    className={`modern-navbar ${scrolled ? 'scrolled' : ''}`}
                    sx={{
                        background: scrolled
                            ? 'rgba(255, 255, 255, 0.95)'
                            : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: scrolled
                            ? '1px solid rgba(0, 0, 0, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: scrolled
                            ? '0 8px 32px rgba(0, 0, 0, 0.1)'
                            : '0 4px 20px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: '#B9D4AA'
                    }}
                >
                    <Container maxWidth="xl">
                        <Toolbar sx={{ px: 0, minHeight: '70px !important' }}>
                            {/* Logo Section */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.02)'
                                    }
                                }}
                                onClick={() => navigate('/')}
                            >
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{
                                        ml: 1,
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '-0.5px'
                                    }}
                                >
                                    BlogAI
                                </Typography>
                            </Box>

                            {/* Desktop Navigation */}
                            <Box sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                ml: 4,
                                gap: 1
                            }}>
                                {navigationItems.map((item) => (
                                    <Button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        startIcon={item.icon}
                                        className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
                                        sx={{
                                            color: isActive(item.path) ? '#667eea' : '#64748b',
                                            fontWeight: isActive(item.path) ? 600 : 500,
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            position: 'relative',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                color: '#667eea',
                                            },
                                            '&.active::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: -8,
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                backgroundColor: '#667eea',
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>

                            <Box sx={{ flexGrow: 1 }} />

                            {/* Right Side Actions */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Search Button */}

                                {isAuthenticated ? (
                                    <>
                                        {/* Create Post Button */}
                                        <Button
                                            variant="contained"
                                            startIcon={<CreateIcon />}
                                            onClick={() => navigate('/create')}
                                            className="create-button"
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                                                display: { xs: 'none', sm: 'flex' },
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                }
                                            }}
                                        >
                                            Viết bài
                                        </Button>

                                        {/* Notifications */}
                                        <Tooltip title="Thông báo" arrow>
                                            <IconButton
                                                className="action-button"
                                                sx={{
                                                    color: '#64748b',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                        color: '#667eea',
                                                    }
                                                }}
                                            >
                                                <Badge badgeContent={3} color="error">
                                                    <NotificationsIcon />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>

                                        {/* Profile Menu */}
                                        <Tooltip title="Tài khoản" arrow>
                                            <IconButton
                                                onClick={handleProfileMenuOpen}
                                                className="profile-button"
                                                sx={{
                                                    ml: 1,
                                                    p: 0.5,
                                                    border: '2px solid transparent',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        borderColor: '#667eea',
                                                        transform: 'scale(1.05)',
                                                    }
                                                }}
                                            >
                                                <Avatar
                                                    src={user?.profile?.avatar}
                                                    alt={user?.name}
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {user?.name?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            onClick={() => navigate('/login')}
                                            className="auth-button"
                                            sx={{
                                                color: '#64748b',
                                                fontWeight: 500,
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                    color: '#667eea',
                                                }
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate('/register')}
                                            className="register-button"
                                            sx={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                }
                                            }}
                                        >
                                            Đăng ký
                                        </Button>
                                    </Box>
                                )}

                                {/* Mobile Menu Button */}
                                <IconButton
                                    onClick={handleMobileMenuToggle}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        ml: 1,
                                        color: '#64748b'
                                    }}
                                >
                                    {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                                </IconButton>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
            </HideOnScroll>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 2,
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        '& .MuiMenuItem-root': {
                            px: 2,
                            py: 1.5,
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            }
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.email}
                    </Typography>
                </Box>

                <MenuItem onClick={() => navigate('/dashboard')}>
                    <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
                    Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate(`/profile/${username}`)}>
                    <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
                    Hồ sơ
                </MenuItem>
                <MenuItem onClick={() => navigate('/bookmarks')}>
                    <BookmarkIcon sx={{ mr: 2, fontSize: 20 }} />
                    Đã lưu
                </MenuItem>
                <MenuItem onClick={() => navigate('/edit-profile')}>
                    <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
                    Cập nhật thông tin
                </MenuItem>
                <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', mt: 1 }}>
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                        Đăng xuất
                    </MenuItem>
                </Box>
            </Menu>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <Fade in={mobileMenuOpen}>
                    <Box
                        className="mobile-menu-overlay"
                        sx={{
                            position: 'fixed',
                            top: 70,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            zIndex: 1200,
                            p: 3,
                            display: { xs: 'block', md: 'none' }
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => {
                                        navigate(item.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    startIcon={item.icon}
                                    fullWidth
                                    sx={{
                                        justifyContent: 'flex-start',
                                        py: 2,
                                        px: 3,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: isActive(item.path) ? 600 : 500,
                                        color: isActive(item.path) ? '#667eea' : '#64748b',
                                        backgroundColor: isActive(item.path) ? 'rgba(102, 126, 234, 0.08)' : 'transparent',
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}

                            {isAuthenticated && (
                                <>
                                    <Button
                                        onClick={() => {
                                            navigate(`/profile/${username}`);
                                            setMobileMenuOpen(false);
                                        }}
                                        startIcon={<PersonIcon />}
                                        fullWidth
                                        sx={{
                                            justifyContent: 'flex-start',
                                            py: 2,
                                            px: 3,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            color: '#64748b',
                                        }}
                                    >
                                        Hồ sơ
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            navigate('/create');
                                            setMobileMenuOpen(false);
                                        }}
                                        startIcon={<CreateIcon />}
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            mt: 2,
                                            py: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Viết bài mới
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </Fade>
            )}
        </>
    );
};

export default Navbar;