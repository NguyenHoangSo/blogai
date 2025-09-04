import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import axios from 'axios';

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAdminStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token || !isAuthenticated) {
                setCheckingAdmin(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.user.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setError('Bạn không có quyền truy cập trang admin.');
                }
            } catch (error) {
                console.error('Lỗi kiểm tra quyền admin:', error);
                setError('Lỗi kiểm tra quyền truy cập.');
            } finally {
                setCheckingAdmin(false);
            }
        };

        checkAdminStatus();
    }, [isAuthenticated]);

    if (loading || checkingAdmin) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                gap={2}
            >
                <CircularProgress />
                <Typography>Đang kiểm tra quyền truy cập...</Typography>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                gap={2}
                p={3}
            >
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Bạn không có quyền truy cập trang admin.'}
                </Alert>
                <Typography variant="body1" color="text.secondary">
                    Chuyển hướng về trang chủ trong 3 giây...
                </Typography>
                {setTimeout(() => window.location.href = '/', 3000)}
            </Box>
        );
    }

    return children;
};

export default AdminProtectedRoute; 