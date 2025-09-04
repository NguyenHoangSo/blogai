import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Card, CardMedia, CardContent,
    Grid, Button, CircularProgress, Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPostsByStatus } from '../services/api';

const DraftPosts = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const res = await getPostsByStatus('draft');
                setDrafts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDrafts();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ px: 4, py: 6 }}>
            <Typography variant="h4" gutterBottom>
                Bản nháp của bạn
            </Typography>

            {drafts.length === 0 ? (
                <Typography color="text.secondary">Chưa có bản nháp nào.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {drafts.map((post) => (
                        <Grid item xs={12} md={6} lg={4} key={post._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {post.coverImage && (
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={post.coverImage}
                                        alt="Ảnh bài viết"
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom noWrap>
                                        {post.title || '[Chưa đặt tiêu đề]'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                                        {post.summary || 'Không có mô tả'}
                                    </Typography>
                                    <Chip label="Bản nháp" size="small" color="warning" />
                                </CardContent>
                                <Box sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/edit/${post._id}`)}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default DraftPosts;
