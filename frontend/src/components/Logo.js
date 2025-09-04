import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

const Logo = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            component={RouterLink}
            to="/"
            sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
            }}
        >
            <Box
                component="img"
                src="/logo.png"
                alt="BlogAI Logo"
                sx={{
                    height: isMobile ? 32 : 50,
                    width: 'auto',
                    mr: 1,
                    borderRadius: '50%'
                }}
            />
            <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #99BC85 30%, #7A9D6B 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                BlogAI
            </Typography>
        </Box>
    );
};

export default Logo; 