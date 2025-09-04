import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    Fade,
    Divider
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Login as LoginIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginUser(formData));
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField('');
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{
                mt: 8,
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            width: '100%',
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }
                        }}
                    >
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                }}
                            >
                                <LoginIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1a202c',
                                    mb: 1,
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                Đăng nhập
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#64748b',
                                    fontSize: '1.1rem'
                                }}
                            >
                                Chào mừng trở lại
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Fade in timeout={300}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': {
                                            fontSize: 20
                                        }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        {/* Login Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Địa chỉ email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon
                                                sx={{
                                                    color: focusedField === 'email' ? '#667eea' : '#94a3b8',
                                                    transition: 'color 0.2s ease'
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(248, 250, 252, 0.8)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(248, 250, 252, 1)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                                borderWidth: 2,
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />

                            {/* Password Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Mật khẩu"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus('password')}
                                onBlur={handleBlur}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon
                                                sx={{
                                                    color: focusedField === 'password' ? '#667eea' : '#94a3b8',
                                                    transition: 'color 0.2s ease'
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                sx={{
                                                    color: '#94a3b8',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        color: '#667eea',
                                                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                                    }
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(248, 250, 252, 0.8)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(248, 250, 252, 1)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'white',
                                            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#667eea',
                                                borderWidth: 2,
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    mt: 2,
                                    mb: 3,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                    },
                                    '&:disabled': {
                                        background: '#94a3b8',
                                        transform: 'none',
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                border: '2px solid transparent',
                                                borderTop: '2px solid white',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                                '@keyframes spin': {
                                                    '0%': { transform: 'rotate(0deg)' },
                                                    '100%': { transform: 'rotate(360deg)' },
                                                },
                                            }}
                                        />
                                        Đang đăng nhập...
                                    </Box>
                                ) : (
                                    'Đăng nhập'
                                )}
                            </Button>

                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    hoặc
                                </Typography>
                            </Divider>

                            {/* Register Link */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Chưa có tài khoản?
                                </Typography>
                                <Link
                                    component={RouterLink}
                                    to="/register"
                                    sx={{
                                        color: '#667eea',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: '#5a67d8',
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Đăng ký ngay
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default Login;