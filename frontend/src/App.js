import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Post from './pages/Post';
import AdminLoginPage from './pages/AdminLogin';
import Admin from './pages/Admin';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import EditPost from './pages/EditPost';
import EditProfile from './pages/EditProfile';
import DraftPosts from './pages/DraftPost';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#99BC85', // Main green color
            light: '#E4EFE7', // Light green
            dark: '#7A9D6B', // Darker shade of green
            contrastText: '#FDFAF6', // Off-white for text
        },
        secondary: {
            main: '#FAF1E6', // Cream color
            light: '#FDFAF6', // Lighter cream
            dark: '#E4D5C3', // Darker cream
            contrastText: '#2C3E50', // Dark text
        },
        background: {
            default: '#FDFAF6', // Off-white background
            paper: '#FFFFFF', // White for cards/paper
        },
        text: {
            primary: '#2C3E50', // Dark text
            secondary: '#34495E', // Slightly lighter text
        },
    },
    typography: {
        fontFamily: '"Poppins", sans-serif',
        h1: {
            fontWeight: 700,
            color: '#2C3E50',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 600,
            color: '#2C3E50',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 600,
            color: '#2C3E50',
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            lineHeight: 1.3,
        },
        h4: {
            fontWeight: 600,
            color: '#2C3E50',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 500,
            color: '#2C3E50',
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 500,
            color: '#2C3E50',
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            lineHeight: 1.4,
        },
        subtitle1: {
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            lineHeight: 1.5,
            fontWeight: 500,
        },
        subtitle2: {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            lineHeight: 1.5,
            fontWeight: 500,
        },
        body1: {
            color: '#34495E',
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            lineHeight: 1.6,
            fontWeight: 400,
        },
        body2: {
            color: '#34495E',
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            lineHeight: 1.6,
            fontWeight: 400,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
        },
        caption: {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: 1.5,
            fontWeight: 400,
        },
        overline: {
            fontSize: { xs: '0.625rem', sm: '0.75rem' },
            lineHeight: 1.5,
            fontWeight: 500,
            textTransform: 'uppercase',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#99BC85',
                    color: '#FDFAF6',
                },
            },
        },
    },
});

function App() {
    const navigate = useNavigate();
    const handleLoginSuccess = () => {
        navigate('/admin'); // hoặc '/admin/posts'
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            {/* Main content wrapper with proper spacing */}
            <Box className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/post/:id" element={<Post />} />
                    <Route path='/edit/:id' element={<EditPost />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/bookmarks" element={<DraftPosts />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <CreatePost />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/admin/login" element={<AdminLoginPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminProtectedRoute>
                                <Admin />
                            </AdminProtectedRoute>
                        }
                    />
                </Routes>
            </Box>
        </ThemeProvider>
    );
}

export default App;