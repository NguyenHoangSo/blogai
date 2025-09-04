// src/pages/EditProfile.js
import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Box, Typography, Snackbar, Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile, updateUserAvatar } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserProfileAsync } from '../redux/slices/authSlice';


const EditProfile = () => {
    const { user } = useSelector(state => state.auth);
    const [formData, setFormData] = useState({ username: '', email: '', bio: '' });
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await fetchUserProfile(user.username);
                setFormData({
                    username: profile.username || '',
                    email: profile.email || '',
                    bio: profile.bio || '',
                    avatar: profile.avatar || ''
                });
            } catch (error) {
                console.error('Lỗi khi tải hồ sơ:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user.username]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateUserProfile(formData);
            dispatch(updateUserProfileAsync(updatedUser));
            setSnackbar({ open: true, message: 'Cập nhật thành công', severity: 'success' });
            setTimeout(() => navigate(`/profile/${user.username}`), 1500);
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            setSnackbar({ open: true, message: 'Lỗi cập nhật thông tin', severity: 'error' });
        }
    };

    const handleAvatarSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const { avatar } = await updateUserAvatar(formData); // gọi API đúng cách
            setFormData(prev => ({ ...prev, avatar }));
            setSnackbar({ open: true, message: 'Tải ảnh thành công', severity: 'success' });
        } catch (error) {
            console.error('Lỗi upload avatar:', error);
            setSnackbar({ open: true, message: 'Tải ảnh thất bại', severity: 'error' });
        }
    };



    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
                Chỉnh sửa thông tin cá nhân
            </Typography>
            <form onSubmit={handleSubmit}>
                <input
                    accept="image/*"
                    type="file"
                    id="avatar"
                    name="avatar"
                    onChange={handleAvatarSelect}
                    style={{ display: 'none' }}
                />
                <label htmlFor="avatar">
                    <Button variant="outlined" component="span" sx={{ mt: 2 }}>
                        Chọn ảnh đại diện
                    </Button>
                </label>
                {formData.avatar && (
                    <Box mt={2}>
                        <img src={formData.avatar} alt="avatar" width={100} height={100} style={{ borderRadius: '50%' }} />
                    </Box>
                )}

                <TextField
                    label="Tên người dùng"
                    name="username"
                    value={formData.username}
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                />
                <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    fullWidth
                    margin="normal"
                    onChange={handleChange}
                />
                <TextField
                    label="Tiểu sử"
                    name="bio"
                    value={formData.bio}
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    onChange={handleChange}
                />
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" disabled={loading}>
                        Lưu thay đổi
                    </Button>
                </Box>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default EditProfile;
