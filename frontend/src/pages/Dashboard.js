import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from "react-redux";
import SavedPostsList from '../components/SavedPostsList';
import { fetchSavedList } from '../services/api.js'

const Dashboard = () => {
    const username = useSelector((state) => state.auth.user?.username || 'testuser');
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bảng Điều Khiển
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Bài Viết Của Bạn
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Quản lý bài viết blog và tạo nội dung mới.
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to="/create"
                                    variant="contained"
                                    color="primary"
                                >
                                    Tạo Bài Viết Mới
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Cài Đặt Hồ Sơ
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Cập nhật thông tin và tùy chọn hồ sơ của bạn.
                                </Typography>
                                <Button
                                    component={RouterLink}
                                    to={`/profile/${username || ''}`}
                                    variant="outlined"
                                    color="primary"
                                >
                                    Chỉnh Sửa Hồ Sơ
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Saved Posts Section */}
                <Box sx={{ mt: 6 }}>
                    <SavedPostsList />
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard; 