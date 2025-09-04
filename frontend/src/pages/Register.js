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
    CircularProgress,
    InputAdornment,
    IconButton,
    Fade,
    Divider
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [formErrors, setFormErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (formData.username.length < 3) {
            errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
            isValid = false;
        }

        if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        if (formErrors[e.target.name]) {
            setFormErrors({
                ...formErrors,
                [e.target.name]: ''
            });
        }
        // Clear global error
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        if (validateForm()) {
            const { confirmPassword, ...registrationData } = formData;
            dispatch(registerUser(registrationData));
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
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
                                <PersonAddIcon sx={{ color: 'white', fontSize: 28 }} />
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
                                Đăng ký
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#64748b',
                                    fontSize: '1.1rem'
                                }}
                            >
                                Chào mừng bạn
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
                                    {typeof error === 'string' ? error : (error.message || 'Đã xảy ra lỗi')}
                                </Alert>
                            </Fade>
                        )}

                        {/* Register Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Username Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Tên người dùng"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={() => handleFocus('username')}
                                onBlur={handleBlur}
                                error={!!formErrors.username}
                                helperText={formErrors.username}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon
                                                sx={{
                                                    color: focusedField === 'username' ? '#667eea' : '#94a3b8',
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

                            {/* Email Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Địa chỉ email"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                                error={!!formErrors.email}
                                helperText={formErrors.email}
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
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus('password')}
                                onBlur={handleBlur}
                                error={!!formErrors.password}
                                helperText={formErrors.password}
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

                            {/* Confirm Password Field */}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => handleFocus('confirmPassword')}
                                onBlur={handleBlur}
                                error={!!formErrors.confirmPassword}
                                helperText={formErrors.confirmPassword}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon
                                                sx={{
                                                    color: focusedField === 'confirmPassword' ? '#667eea' : '#94a3b8',
                                                    transition: 'color 0.2s ease'
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle confirm password visibility"
                                                onClick={handleClickShowConfirmPassword}
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
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                                        <CircularProgress size={20} sx={{ color: 'white' }} />
                                        Đang tạo tài khoản...
                                    </Box>
                                ) : (
                                    'Đăng ký'
                                )}
                            </Button>

                            <Divider sx={{ my: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    hoặc
                                </Typography>
                            </Divider>

                            {/* Login Link */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Đã có tài khoản?
                                </Typography>
                                <Link
                                    component={RouterLink}
                                    to="/login"
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
                                    Đăng nhập ngay
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default Register;