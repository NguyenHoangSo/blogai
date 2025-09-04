import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Stack,
    Chip,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { generatePost } from '../services/api';

const defaultStructure = [
    "Giới thiệu",
    "Nội dung chính",
    "Kết luận"
];

const tones = [
    "Thân thiện và chuyên nghiệp",
    "Hài hước",
    "Truyền cảm hứng",
    "Nghiêm túc",
    "Sáng tạo"
];

const AIBlogGenerator = ({ onGenerate }) => {
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    const [tone, setTone] = useState(tones[0]);
    const [structure, setStructure] = useState(defaultStructure.join(', '));
    const [keywords, setKeywords] = useState('');
    const [length, setLength] = useState('1000 từ');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setResult('');
        try {
            const config = {
                topic,
                audience,
                tone,
                structure: structure.split(',').map(s => s.trim()).filter(Boolean),
                keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
                length
            };
            const response = await generatePost(config);
            setResult(response.content);
            if (onGenerate) onGenerate(response.content);
        } catch (err) {
            setError(err.message || 'Không thể tạo bài viết');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                maxWidth: 500,
                mx: 'auto',
                mt: 4,
                p: 4,
                borderRadius: 3,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
                ✨ Tạo bài viết với AI
            </Typography>
            <Stack spacing={2}>
                <TextField
                    label="Chủ đề bài viết"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    fullWidth
                    required
                />
                <TextField
                    label="Đối tượng độc giả"
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                    fullWidth
                />
                <TextField
                    select
                    label="Giọng điệu"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                    fullWidth
                >
                    {tones.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Cấu trúc bài viết (phân cách bởi dấu phẩy)"
                    value={structure}
                    onChange={e => setStructure(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Từ khóa SEO (phân cách bởi dấu phẩy)"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Độ dài mong muốn"
                    value={length}
                    onChange={e => setLength(e.target.value)}
                    fullWidth
                />
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesome />}
                    onClick={handleGenerate}
                    disabled={loading || !topic}
                    sx={{
                        bgcolor: '#1976d2',
                        '&:hover': { bgcolor: '#1565c0' },
                        textTransform: 'none',
                        fontWeight: 500
                    }}
                >
                    {loading ? 'Đang tạo...' : 'Tạo bài viết'}
                </Button>
                {error && (
                    <Typography color="error" variant="body2">{error}</Typography>
                )}
                {result && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Kết quả:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9', whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
                            {result}
                        </Paper>
                        {onGenerate && (
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => onGenerate(result)}
                            >
                                Chèn vào trình soạn thảo
                            </Button>
                        )}
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default AIBlogGenerator;