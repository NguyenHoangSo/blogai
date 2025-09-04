import { Box, Avatar, TextField, Button } from '@mui/material';
import { useState, useCallback } from 'react';
import SendIcon from '@mui/icons-material/Send';

const CommentInput = ({ user, onSubmit, isSubmitting }) => {
    const [commentText, setCommentText] = useState('');

    const canSubmit = commentText.trim().length > 0 && !isSubmitting;

    const handleSubmit = useCallback(() => {
        if (!canSubmit) return;
        onSubmit(commentText.trim());
        setCommentText('');
    }, [commentText, onSubmit, canSubmit]);

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter' && canSubmit) {
            handleSubmit();
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mt: 3, mb: 2 }}>
            <Avatar
                src={user?.profile?.avatar || '/default-avatar.png'}
                alt={user?.username || 'User'}
                sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ flex: 1 }}>
                <TextField
                    multiline
                    fullWidth
                    placeholder="Viết bình luận..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    minRows={3}
                    variant="outlined"
                    sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        },
                    }}
                />
                <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Button
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        sx={{ borderRadius: 2 }}
                    >
                        Gửi
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CommentInput;
