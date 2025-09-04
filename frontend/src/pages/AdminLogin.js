import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import axios from 'axios';
import { loginAdmin } from '../services/api';

const AdminLoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginAdmin({ email, password });
            // Lưu token vào localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            localStorage.setItem('lastActivity', new Date().toISOString());

            // Cập nhật Redux state
            dispatch(loginUser.fulfilled({
                token: res.data.token,
                user: res.data.user
            }, 'admin-login'));

            onLoginSuccess?.(); // optional callback
        } catch (err) {
            const msg = err.response?.data?.msg || 'Đăng nhập thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            minHeight="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#f5f5f5"
        >
            <Paper elevation={3} sx={{ p: 4, width: 360 }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Đăng nhập Admin
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Mật khẩu"
                        fullWidth
                        margin="normal"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminLoginPage;
