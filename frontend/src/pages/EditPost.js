import React, { useEffect, useState } from 'react';
import {
    Box, TextField, Button, Typography, Select, MenuItem,
    InputLabel, FormControl, Paper, CircularProgress
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCategories } from '../services/api';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/post/${id}`);
                setPost(res.data);
                setTitle(res.data.title);
                setContent(res.data.content);
                setCategory(res.data.category?._id || res.data.category); // nếu category là object
            } catch (error) {
                console.error('Lỗi tải bài viết:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getCategories();
            setCategories(res.data);
        }
        fetchCategories();
    }, [])


    const handleSubmit = async () => {
        setSaving(true);
        try {
            await axios.put(`http://localhost:5000/api/posts/${id}`, {
                title,
                content,
                category,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/post/${id}`);
        } catch (error) {
            console.error('Lỗi cập nhật bài viết:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    ✏️ Chỉnh sửa bài viết
                </Typography>

                <TextField
                    label="Tiêu đề"
                    fullWidth
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                        label="Danh mục"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cate) => (
                            <MenuItem key={cate._id} value={cate._id}>
                                {cate.name}
                            </MenuItem>
                        ))}
                        {/* <MenuItem value="Lifestyle">Lối sống</MenuItem>
                        <MenuItem value="Food">Ẩm thực</MenuItem>
                        <MenuItem value="Travel">Du lịch</MenuItem>
                        <MenuItem value="Health">Sức khỏe</MenuItem>
                        <MenuItem value="Other">Khác</MenuItem> */}
                    </Select>
                </FormControl>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                        Nội dung bài viết
                    </Typography>
                    <ReactQuill
                        value={content}
                        onChange={setContent}
                        style={{ height: '300px' }}
                        theme="snow"
                    />
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    {saving ? 'Đang lưu...' : 'Cập nhật bài viết'}
                </Button>
            </Paper>
        </Box>
    );
};

export default EditPost;
