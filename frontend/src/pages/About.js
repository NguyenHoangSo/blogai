import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider
} from '@mui/material';
import {
    AutoAwesome,
    Speed,
    Security,
    Group
} from '@mui/icons-material';

const About = () => {
    const features = [
        {
            icon: <AutoAwesome fontSize="large" />,
            title: 'Nội dung được hỗ trợ bởi AI',
            description: 'Tạo nội dung chất lượng cao với sự trợ giúp của công nghệ AI tiên tiến.'
        },
        {
            icon: <Speed fontSize="large" />,
            title: 'Nhanh chóng & Hiệu quả',
            description: 'Tạo và xuất bản nội dung nhanh chóng với quy trình làm việc hợp lý của chúng tôi.'
        },
        {
            icon: <Security fontSize="large" />,
            title: 'Nền tảng an toàn',
            description: 'Nội dung và dữ liệu của bạn được bảo vệ bằng biện pháp bảo mật cấp doanh nghiệp.'
        },
        {
            icon: <Group fontSize="large" />,
            title: 'Tập trung vào cộng đồng',
            description: 'Kết nối với các nhà văn và độc giả khác trong cộng đồng đang phát triển của chúng tôi.'
        }
    ];

    const teamMembers = [
        {
            name: 'Nguyễn Hoàng Sơn',
            role: 'Lập trình viên',
            avatar: '/team/john.jpg'
        },
        {
            name: 'Nguyễn Bá Ngọc',
            role: 'Người hướng dẫn',
            avatar: '/team/jane.jpg'
        },
        {
            name: 'ChatGPT',
            role: 'Chuyên gia AI',
            avatar: '/team/mike.jpg'
        }
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: 8,
                    mb: 4
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" component="h1" gutterBottom align="center">
                        Về BlogAI
                    </Typography>
                    <Typography variant="h5" align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
                        Trao quyền cho các nhà văn bằng trí tuệ nhân tạo để tạo ra nội dung tuyệt vời
                    </Typography>
                </Container>
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ mb: 8 }}>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                    Tại sao nên chọn BlogAI?
                </Typography>
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                                <Box sx={{ color: 'primary.main', mb: 2 }}>
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Mission Section */}
            <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" component="h2" gutterBottom align="center">
                        Xứ mệnh
                    </Typography>
                    <Typography variant="body1" align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
                        Tại BlogAI, chúng tôi tin rằng mọi người đều có một câu chuyện để kể. Sứ mệnh của chúng tôi là làm cho việc tạo nội dung
                        trở nên dễ tiếp cận và thú vị đối với mọi người bằng cách tận dụng sức mạnh của trí tuệ nhân tạo. Chúng tôi cam kết giúp các nhà văn, blogger và người sáng tạo nội dung
                        tạo ra nội dung chất lượng cao hiệu quả hơn trong khi vẫn duy trì giọng văn và phong cách độc đáo của họ.
                    </Typography>
                </Container>
            </Box>

            {/* Team Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h4" component="h2" gutterBottom align="center">
                    Đội ngũ
                </Typography>
                <Grid container spacing={4} sx={{ mt: 2 }}>
                    {teamMembers.map((member, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <Card sx={{ textAlign: 'center', p: 3 }}>
                                <Avatar
                                    src={member.avatar}
                                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                />
                                <Typography variant="h6" gutterBottom>
                                    {member.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {member.role}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default About; 