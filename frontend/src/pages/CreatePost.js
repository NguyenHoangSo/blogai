import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Paper, IconButton, Fade, Tooltip,
    Chip, Stack, Dialog, DialogTitle, DialogContent,
    List, ListItem, ListItemText, Divider, CircularProgress
} from '@mui/material';
import {
    AutoAwesome, Publish, ArrowBack, Save, Lightbulb as LightbulbIcon,
    Refresh
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, draftPost, generatePost, generateTitle, getCategories } from '../services/api';
import { setNotification } from '../redux/slices/notificationSlice';
import DeleteIcon from '@mui/icons-material/Delete';

const CreatePost = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const titleRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isAIGenerated: false,
        topic: '',
        audience: '',
        tone: 'thân thiện',
        keywords: '',
        structure: "Giới thiệu, Thân bài, Kết luận",
        length: '1000 từ',

        // post blog
        summary: '',
        tags: '',
        status: '',
        featured: false,
        coverImage: null,
    });


    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [autoSaved, setAutoSaved] = useState(false);
    const [showTitleDialog, setShowTitleDialog] = useState(false);
    const [titleDescription, setTitleDescription] = useState('');
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
    const [categories, setcateGories] = useState([]);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.title || formData.content) {
                localStorage.setItem('draft-post', JSON.stringify(formData));
                setAutoSaved(true);
                setTimeout(() => setAutoSaved(false), 2000);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [formData]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                setcateGories(res.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchCategories();
    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log(file)
        if (file && file.size > 2 * 1024 * 1024) {
            dispatch(setNotification({ message: 'Ảnh vượt quá 2MB', type: 'warning' }));
            return;
        }
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: file }));
        }
    };

    const handleContentChange = (value) => {
        setFormData(prev => ({ ...prev, content: value }));
    };

    const handleGenerateTitles = async () => {
        if (!titleDescription.trim()) {
            dispatch(setNotification({ message: 'Vui lòng nhập mô tả cho tiêu đề', type: 'warning' }));
            return;
        }

        try {
            setIsGeneratingTitles(true);
            const res = await generateTitle(titleDescription);
            if (res.content?.length > 0) {
                setSuggestedTitles(res.content);
                dispatch(setNotification({ message: 'Đã tạo danh sách tiêu đề!', type: 'success' }));
            } else {
                dispatch(setNotification({ message: 'Không thể tạo tiêu đề', type: 'warning' }));
            }
        } catch (err) {
            dispatch(setNotification({ message: err.message || 'Lỗi tạo tiêu đề', type: 'error' }));
        } finally {
            setIsGeneratingTitles(false);
        }
    };

    const handleApplyTitle = (title) => {
        setFormData(prev => ({ ...prev, title }));
        setShowTitleDialog(false);
        setTitleDescription('');
        setSuggestedTitles([]);
        dispatch(setNotification({ message: 'Đã áp dụng tiêu đề!', type: 'success' }));
    };

    const suggestContentWithAI = async () => {
        setAiLoading(true);
        setError('');
        try {
            const payload = {
                topic: formData.topic,
                audience: formData.audience,
                tone: formData.tone,
                structure: formData.structure.split(',').map(s => s.trim()).filter(Boolean),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
                length: formData.length,
            };

            const res = await generatePost(payload);

            setFormData(prev => ({
                ...prev,
                content: res.content,
                isAIGenerated: true
            }));

            dispatch(setNotification({
                message: 'Đã tạo nội dung bằng AI!',
                type: 'success'
            }));

            setShowAIPanel(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lỗi AI');
        } finally {
            setAiLoading(false);
        }
    };
    const handleSaveDraft = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries({ ...formData, status: 'draft' }).forEach(([key, value]) => {
                if (key === 'coverImage') {
                    if (value instanceof File) {
                        data.append('coverImage', value);
                    }
                } else {
                    data.append(key, value);
                }
            });
            data.append('author', user._id);

            await draftPost(data); // Gọi API lưu bài viết dạng nháp
            dispatch(setNotification({ message: 'Đã lưu bản nháp thành công!', type: 'success' }));
            localStorage.removeItem('draft-post');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Không thể lưu bản nháp');
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'coverImage') {
                    if (value instanceof File) {
                        data.append('coverImage', value);
                    }
                } else {
                    data.append(key, value);
                }
            });
            data.append('author', user._id);
            console.log([...data.entries()])
            await createPost(data);
            dispatch(setNotification({ message: 'Bài viết đã được đăng!', type: 'success' }));
            localStorage.removeItem('draft-post');
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Không thể tạo bài viết');
        } finally {
            setLoading(false);
        }
    };

    const renderFormattedText = (text) => {
        const escapeAsterisks = (t) => t.replace(/\\\*/g, '&#42;');

        const lines = text.split('\n');
        const elements = [];
        let orderedList = [];
        let unorderedList = [];

        const flushLists = () => {
            if (orderedList.length > 0) {
                elements.push(
                    <Box
                        component="ol"
                        sx={{
                            pl: 3,
                            color: 'text.primary',
                            '& li': { mb: 1.5 },
                        }}
                        key={`ol-${elements.length}`}
                    >
                        {orderedList.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </Box>
                );
                orderedList = [];
            }
            if (unorderedList.length > 0) {
                elements.push(
                    <Box
                        component="ul"
                        sx={{
                            pl: 3,
                            color: 'text.primary',
                            '& li::marker': { color: 'primary.main' },
                            '& li': { mb: 1.5 },
                        }}
                        key={`ul-${elements.length}`}
                    >
                        {unorderedList.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                    </Box>
                );
                unorderedList = [];
            }
        };

        const formatText = (raw) => {
            return escapeAsterisks(raw)
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e88e5">$1</strong>') // blue bold
                .replace(/\*(.*?)\*/g, '<em style="color:#6d4c41">$1</em>'); // brown italic
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (trimmed === '') {
                flushLists();
                elements.push(<Box key={`br-${index}`} sx={{ height: 10 }} />);
                return;
            }

            if (trimmed.startsWith('### ')) {
                flushLists();
                elements.push(
                    <Typography
                        key={index}
                        variant="h6"
                        sx={{ mt: 3, fontWeight: 700, color: 'primary.dark' }}
                    >
                        {trimmed.replace(/^### /, '')}
                    </Typography>
                );
                return;
            }

            if (trimmed.startsWith('## ')) {
                flushLists();
                elements.push(
                    <Typography
                        key={index}
                        variant="h5"
                        sx={{ mt: 4, fontWeight: 800, color: 'secondary.main' }}
                    >
                        {trimmed.replace(/^## /, '')}
                    </Typography>
                );
                return;
            }

            if (trimmed.startsWith('<p>') && trimmed.endsWith('</p>')) {
                flushLists();
                const inner = trimmed.replace(/^<p>/, '').replace(/<\/p>$/, '');
                const formatted = formatText(inner);
                elements.push(
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{ mb: 1.5, color: 'text.secondary', lineHeight: 1.8 }}
                        dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                );
                return;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                const clean = trimmed.replace(/^\d+\.\s+/, '');
                orderedList.push(formatText(clean));
                return;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                const clean = trimmed.replace(/^[-*]\s+/, '');
                unorderedList.push(formatText(clean));
                return;
            }

            flushLists();
            const formatted = formatText(trimmed);
            elements.push(
                <Typography
                    key={index}
                    variant="body1"
                    sx={{ mb: 1.5, color: 'text.primary', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                />
            );
        });

        flushLists();
        return elements;
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
            {/* Header */}
            <Box sx={{ position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 1000, px: 3, py: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ maxWidth: 1000, mx: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Tooltip title="Quay lại">
                            <IconButton onClick={() => navigate('/dashboard')}><ArrowBack /></IconButton>
                        </Tooltip>
                        <Typography variant="h6">Tạo bài viết mới</Typography>
                        {autoSaved && <Chip label="Đã lưu" size="small" color="success" variant="outlined" />}
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Trợ lý AI">
                            <IconButton onClick={() => setShowAIPanel(p => !p)}><AutoAwesome /></IconButton>
                        </Tooltip>
                        <Button variant="contained" startIcon={<Publish />} disabled={loading || !formData.title} onClick={handleSubmit}>
                            {loading ? 'Đang đăng...' : 'Xuất bản'}
                        </Button>
                    </Stack>
                </Box>
            </Box>

            {/* AI Panel */}
            <Fade in={showAIPanel}>
                <Paper sx={{ position: 'absolute', right: 24, top: 80, width: 350, p: 3, zIndex: 1001, boxShadow: 3 }}>
                    <IconButton onClick={() => setShowAIPanel(false)} size="small" sx={{ position: 'absolute', top: 8, right: 8, color: '#888' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome fontSize="small" /> Gợi ý nội dung AI
                    </Typography>
                    <TextField name="topic" label="Chủ đề" fullWidth value={formData.topic} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="audience" label="Đối tượng" fullWidth value={formData.audience} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="tone" label="Giọng văn" fullWidth value={formData.tone} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="structure" label="Cấu trúc" fullWidth value={formData.structure} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="keywords" label="Từ khóa" fullWidth value={formData.keywords} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField name="length" label="Độ dài" fullWidth value={formData.length} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField
                        select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        SelectProps={{ native: true }}
                    >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cate) => (
                            <option key={cate._id} value={cate._id}>{cate.name}</option>
                        ))}
                    </TextField>
                    <Button variant="contained" fullWidth onClick={suggestContentWithAI} disabled={aiLoading} startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoAwesome />}>
                        {aiLoading ? 'Đang tạo...' : 'Tạo nội dung AI'}
                    </Button>
                    {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
                </Paper>
            </Fade>

            {/* Main Content */}
            <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 4 }}>
                <Paper sx={{ p: 4, boxShadow: 1 }}>
                    {/* Upload Image */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Ảnh đại diện bài viết</Typography>
                        <Button variant="outlined" component="label" startIcon={<Publish />}>
                            Chọn ảnh
                            <input type="file" name="coverImage" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>

                        {formData.coverImage && (
                            <Box mt={3} display="flex" flexDirection="column" alignItems="center" bgcolor="#f9f9f9" p={2} borderRadius={2} border="1px solid #e0e0e0">
                                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                    Xem trước ảnh đại diện
                                </Typography>
                                <Box sx={{ width: '100%', maxWidth: 400, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 2 }}>
                                    <img
                                        src={URL.createObjectURL(formData.coverImage)}
                                        alt="Xem trước ảnh"
                                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                    />
                                </Box>
                                <Button
                                    onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    size="small"
                                >
                                    Xóa ảnh
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Title Section */}
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            inputRef={titleRef}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tiêu đề bài viết..."
                            fullWidth
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                                sx: { fontSize: '1.5rem', fontWeight: 700 },
                                endAdornment: (
                                    <Tooltip title="Gợi ý tiêu đề bằng AI">
                                        <IconButton onClick={() => setShowTitleDialog(true)} sx={{ ml: 1 }}>
                                            <LightbulbIcon color="primary" />
                                        </IconButton>
                                    </Tooltip>
                                )
                            }}
                        />
                    </Box>

                    {/* Editor */}
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'align': [] }],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['blockquote', 'code-block'],
                                ['link', 'image', 'video'],
                                ['clean']
                            ]
                        }}
                        formats={[
                            'header', 'bold', 'italic', 'underline', 'strike',
                            'color', 'background', 'align',
                            'list', 'bullet',
                            'blockquote', 'code-block',
                            'link', 'image', 'video'
                        ]}
                        style={{ height: '400px', marginBottom: '50px' }}
                    />
                    {formData.isAIGenerated && (
                        <Chip
                            label="Nội dung được tạo bởi AI 🤖"
                            size="small"
                            sx={{ mt: 2 }}
                            color="secondary"
                            variant="outlined"
                        />
                    )}
                </Paper>

                {/* Save Draft */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={handleSaveDraft}
                        sx={{ px: 4 }}
                    >
                        Lưu bản nháp
                    </Button>
                </Box>
            </Box>

            {/* AI Title Suggestion Dialog */}
            <Dialog
                open={showTitleDialog}
                onClose={() => {
                    setShowTitleDialog(false);
                    setTitleDescription('');
                    setSuggestedTitles([]);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LightbulbIcon color="primary" /> Gợi ý tiêu đề bằng AI
                        </Typography>
                        <IconButton onClick={() => {
                            setShowTitleDialog(false);
                            setTitleDescription('');
                            setSuggestedTitles([]);
                        }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    {suggestedTitles.length === 0 ? (
                        <>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Mô tả nội dung bài viết để AI tạo các tiêu đề phù hợp
                            </Typography>
                            <TextField
                                multiline
                                rows={3}
                                fullWidth
                                autoFocus
                                value={titleDescription}
                                onChange={(e) => setTitleDescription(e.target.value)}
                                placeholder="Ví dụ: Bài viết hướng dẫn sử dụng React Hook Form cho người mới bắt đầu..."
                                sx={{ mb: 3 }}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleGenerateTitles}
                                disabled={!titleDescription.trim() || isGeneratingTitles}
                                startIcon={isGeneratingTitles ? <CircularProgress size={20} /> : <AutoAwesome />}
                                size="large"
                            >
                                {isGeneratingTitles ? 'Đang tạo tiêu đề...' : 'Tạo tiêu đề gợi ý'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                                Chọn một tiêu đề phù hợp nhất:
                            </Typography>

                            <List sx={{ mb: 2 }}>
                                {suggestedTitles.map((title, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            button
                                            onClick={() => handleApplyTitle(title)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: 'primary.light',
                                                    boxShadow: 1
                                                }
                                            }}
                                        >
                                            <ListItemText
                                                primary={title}
                                                primaryTypographyProps={{
                                                    fontWeight: 'medium',
                                                    color: 'text.primary'
                                                }}
                                            />
                                        </ListItem>
                                        {index < suggestedTitles.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>

                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setSuggestedTitles([]);
                                        setTitleDescription('');
                                    }}
                                    startIcon={<Refresh />}
                                >
                                    Tạo lại tiêu đề
                                </Button>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowTitleDialog(false);
                                        setTitleDescription('');
                                        setSuggestedTitles([]);
                                    }}
                                >
                                    Hủy bỏ
                                </Button>
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default CreatePost;