import React, { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Avatar,
    CircularProgress,
    Pagination,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    IconButton,
    Fade,
    Skeleton,
    Paper,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    TrendingUp as TrendingIcon,
    Schedule as ScheduleIcon,
    Visibility as ViewIcon,
    FavoriteOutlined as HeartIcon,
    BookmarkBorderOutlined as BookmarkIcon,
    ArrowForward as ArrowIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPosts, fetchFeaturedPosts, getCategories, getCateById } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Home = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    const [cate, setCate] = useState('');
    const [post, setPost] = useState({});


    useEffect(() => {
        const fetchCate = async () => {
            const res = await getCategories();
            setCategories(res.data);
        }
        fetchCate();
    }, [])

    useEffect(() => {
        loadPosts();
        if (page === 1) loadFeaturedPosts();
    }, [page, category]);

    const loadPosts = async () => {
        try {
            setSearchLoading(true);
            const response = await fetchPosts({ page, search, category });
            setPosts(response.posts);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải bài viết:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const loadFeaturedPosts = async () => {
        try {
            const featured = await fetchFeaturedPosts();
            setFeaturedPosts(featured);
        } catch (error) {
            console.error('Lỗi khi tải bài viết nổi bật:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getNameOfCate = async (id) => {
            try {
                console.log("bai post", post)
                const res = await getCateById(id);
                setCate(res.name);
                console.log(cate)
            } catch (error) {
                console.log(error);
            }
        }
        getNameOfCate(post.category);
    }, [])



    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim().length >= 2) {
            setSearch(searchInput.trim());
            setPage(1); // reset về trang đầu tiên
        }
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchInput('');
        setPage(1);
    };

    const handleClearAllFilters = () => {
        setSearchInput('');
        setCategory('');
        setPage(1);
        // ('');
    };

    const getCategoryLabel = (categoryValue) => {
        const category = categories.find(cat => cat.value === categoryValue);
        return category ? category.label : categoryValue;
    };

    const HeroSection = () => (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 4,
                p: 6,
                mb: 6,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                }
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    Khám Phá Những Câu Chuyện Tuyệt Vời
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, maxWidth: 600 }}>
                    Khám phá thế giới tri thức, sáng tạo và cảm hứng qua bộ sưu tập các bài viết và câu chuyện được tuyển chọn của chúng tôi.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    onClick={() => navigate('/create')}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                        }
                    }}
                >
                    Bắt Đầu Viết
                </Button>
            </Box>
        </Box>
    );

    const FeaturedPostCard = ({ post, index }) => (
        <Fade in={true} timeout={600 + index * 200}>
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        borderColor: 'primary.main',
                    },
                }}
                onClick={() => navigate(`/post/${post._id}`)}
            >
                <Box sx={{ position: 'relative' }}>
                    <CardMedia
                        component="img"
                        height="220"
                        image={post.coverImage || '/default-post.jpg'}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                    />
                    <Chip
                        icon={<TrendingIcon />}
                        label="Nổi bật"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                        >
                            <HeartIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                        >
                            <BookmarkIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                            alt={post.author?.username}
                            src={post.author?.profile?.avatar || 'logo.png'}
                            sx={{ width: 32, height: 32, mr: 1.5 }}
                        />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {post.author?.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.3,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {post.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 3,
                            lineHeight: 1.6
                        }}
                    >
                        {/* {post.excerpt} */}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                            label={cate}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <ViewIcon fontSize="small" />
                            <Typography variant="caption" sx={{ fontSize: '16px' }}>
                                {post.views || Math.floor(Math.random() * 10)} lượt xem
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );

    const RegularPostCard = ({ post, index }) => (
        <Fade in={true} timeout={400 + index * 100}>
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        borderColor: 'primary.light',
                    },
                }}
                onClick={() => navigate(`/post/${post._id}`)}
            >
                <CardMedia
                    component="img"
                    height="180"
                    image={post.coverImage || '/default-post.jpg'}
                    alt={post.title}
                    sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar
                            src={post.author?.profile?.avatar}
                            alt={post.author?.username}
                            sx={{ width: 28, height: 28, mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {post.author?.username}
                        </Typography>
                    </Box>
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 600,
                            lineHeight: 1.3,
                            mb: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {post.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                            lineHeight: 1.5
                        }}
                    >
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                        <Chip
                            label={post.category?.name}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon fontSize="small" color="disabled" />
                            <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );

    const SearchAndFilter = () => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                    Tìm kiếm & Lọc bài viết
                </Typography>
            </Box>

            <Box
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
                {/* Search Input */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                        fullWidth
                        placeholder="Nhập từ khóa tìm kiếm: tiêu đề, nội dung, tác giả..."
                        variant="outlined"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchInput && (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClearSearch}
                                        edge="end"
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'white',
                                '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                    },
                                },
                                '&.Mui-focused': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                        borderWidth: 2,
                                    },
                                },
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            minWidth: 120,
                            height: 56,
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }
                        }}
                        disabled={searchLoading}
                    >
                        {searchLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            'Tìm kiếm'
                        )}
                    </Button>
                </Box>

                {/* Category Filter and Clear Button */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                            value={category.name}
                            label="Danh mục"
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                                // (searchInput); // gọi tìm kiếm lại với cùng từ khóa
                            }}
                            sx={{
                                borderRadius: 2,
                                bgcolor: 'white',
                                '&:hover': {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">Tất cả danh mục</MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Active Filters Display */}
                    {(search || category) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                                Bộ lọc đang áp dụng:
                            </Typography>
                            {search && (
                                <Chip
                                    label={`Từ khóa: "${search}"`}
                                    size="small"
                                    onDelete={handleClearSearch}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            {category && (
                                <Chip
                                    label={`Danh mục: ${getCategoryLabel(category)}`}
                                    size="small"
                                    // onDelete={() => {
                                    //     setCategory('');
                                    //     setPage(1);
                                    // }}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                            <Button
                                size="small"
                                onClick={handleClearAllFilters}
                                sx={{
                                    textTransform: 'none',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                Xóa tất cả
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Search Results Info */}
                {!loading && (search || category) && (
                    <Box sx={{
                        p: 2,
                        bgcolor: 'primary.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'primary.200'
                    }}>
                        <Typography variant="body2" color="primary.main" fontWeight={500}>
                            {posts.length > 0
                                ? `Tìm thấy ${posts.length} bài viết phù hợp với tiêu chí tìm kiếm`
                                : 'Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm'
                            }
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );

    const LoadingSkeleton = () => (
        <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ borderRadius: 2 }}>
                        <Skeleton variant="rectangular" height={180} />
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Skeleton variant="circular" width={28} height={28} sx={{ mr: 1 }} />
                                <Skeleton variant="text" width={100} />
                            </Box>
                            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                            <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                            <Skeleton variant="text" height={20} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LoadingSkeleton />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <HeroSection />

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <TrendingIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h4" component="h2" fontWeight={700}>
                            Bài Viết Nổi Bật
                        </Typography>
                    </Box>
                    <Grid container spacing={4}>
                        {featuredPosts.slice(0, 3).map((post, index) => (
                            <Grid item xs={12} md={4} key={post._id}>
                                <FeaturedPostCard post={post} index={index} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            <Divider sx={{ my: 6 }} />

            {/* Search & Filter */}
            <SearchAndFilter />

            {/* Recent Posts */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
                    Bài Viết Mới Nhất
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Cập nhật những nội dung và thông tin mới nhất từ chúng tôi
                </Typography>
            </Box>

            {/* Loading State for Search */}
            {searchLoading ? (
                <LoadingSkeleton />
            ) : (
                <Grid container spacing={3}>
                    {posts.map((post, index) => (
                        <Grid item xs={12} sm={6} md={4} key={post._id}>
                            <RegularPostCard post={post} index={index} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Empty State */}
            {posts.length === 0 && !loading && !searchLoading && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4
                    }}
                >
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        Không tìm thấy bài viết nào
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {search || category
                            ? 'Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc duyệt tất cả danh mục'
                            : 'Chưa có bài viết nào được đăng tải'
                        }
                    </Typography>
                    {(search || category) && (
                        <Button
                            variant="outlined"
                            onClick={handleClearAllFilters}
                        >
                            Xóa Bộ Lọc
                        </Button>
                    )}
                </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>
            )}
        </Container>
    );
};

export default Home;