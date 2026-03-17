import React from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    Stack,
    IconButton,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
    Avatar,
    Chip
} from '@mui/material';
import {
    HealthAndSafety,
    Psychology,
    AutoGraph,
    Speed,
    Security,
    Devices,
    ArrowForward,
    CloudUpload,
    Assignment,
    Chat as ChatIcon,
    ChevronRight,
    PlayCircleOutline,
    Translate
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ButtonGroup } from '@mui/material';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'te', label: 'తె' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { t, i18n } = useTranslation();

    const handleLangChange = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('wellbot_lang', code);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            title: t('landing.features_assist'),
            desc: t('landing.features_assist_desc'),
            icon: <Psychology sx={{ fontSize: 40 }} />,
            color: "#6366f1"
        },
        {
            title: t('landing.features_analyze'),
            desc: t('landing.features_analyze_desc'),
            icon: <CloudUpload sx={{ fontSize: 40 }} />,
            color: "#ec4899"
        },
        {
            title: t('landing.features_analytics'),
            desc: t('landing.features_analytics_desc'),
            icon: <AutoGraph sx={{ fontSize: 40 }} />,
            color: "#8b5cf6"
        },
        {
            title: t('landing.features_recovery'),
            desc: t('landing.features_recovery_desc'),
            icon: <Assignment sx={{ fontSize: 40 }} />,
            color: "#10b981"
        }
    ];

    const steps = [
        { id: "01", title: t('landing.steps_identity'), desc: t('landing.steps_identity_desc') },
        { id: "02", title: t('landing.steps_input'), desc: t('landing.steps_input_desc') },
        { id: "03", title: t('landing.steps_generation'), desc: t('landing.steps_generation_desc') },
        { id: "04", title: t('landing.steps_optimize'), desc: t('landing.steps_optimize_desc') }
    ];

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* Header */}
            <AppBar position="fixed" sx={{
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                boxShadow: 'none'
            }}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
                            <Box sx={{
                                width: 40, height: 40,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <HealthAndSafety sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -1 }}>WellBot</Typography>
                        </Box>

                        <Stack direction="row" spacing={isMobile ? 1 : 4} alignItems="center">
                            {!isMobile && (
                                <>
                                    <Button onClick={() => scrollToSection('features')} sx={{ color: 'var(--text-secondary)', fontWeight: 800, '&:hover': { color: 'var(--primary)' } }}>{t('landing.features')}</Button>
                                    <Button onClick={() => scrollToSection('how-it-works')} sx={{ color: 'var(--text-secondary)', fontWeight: 800, '&:hover': { color: 'var(--primary)' } }}>{t('landing.howItWorks')}</Button>
                                    <Button onClick={() => navigate('/login')} sx={{ color: 'var(--text-secondary)', fontWeight: 800, '&:hover': { color: 'var(--primary)' } }}>{t('login.signIn')}</Button>
                                </>
                            )}
                            
                            <ButtonGroup size="small" sx={{ ml: 2 }}>
                                {LANGUAGES.map(lang => (
                                    <Button
                                        key={lang.code}
                                        onClick={() => handleLangChange(lang.code)}
                                        sx={{
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            minWidth: 32,
                                            py: 0.4,
                                            px: 0.8,
                                            border: '1px solid var(--glass-border) !important',
                                            bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'transparent',
                                            color: i18n.language === lang.code ? 'white' : 'var(--text-secondary)',
                                            '&:hover': { bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'rgba(255,255,255,0.08)' },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {lang.label}
                                    </Button>
                                ))}
                            </ButtonGroup>

                            {!isMobile && (
                                <Button
                                    onClick={() => navigate('/login')}
                                    variant="contained"
                                    sx={{
                                        borderRadius: '12px',
                                        px: 3,
                                        fontWeight: 900,
                                        background: 'linear-gradient(to right, var(--primary), var(--accent))'
                                    }}
                                >
                                    {t('landing.getStarted')}
                                </Button>
                            )}
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ pt: { xs: 15, md: 25 }, pb: 15 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Chip
                                label="BETA VERSION LIVE"
                                sx={{
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    color: 'var(--primary)',
                                    fontWeight: 900,
                                    mb: 3,
                                    border: '1px solid rgba(99, 102, 241, 0.2)'
                                }}
                            />
                            <Typography variant="h1" sx={{
                                fontWeight: 950,
                                fontSize: { xs: '2.5rem', md: '4.5rem' },
                                lineHeight: 1,
                                letterSpacing: -3,
                                mb: 3
                            }}>
                                {t('landing.heroTitle').split(' ').slice(0, -2).join(' ')} <br />
                                <span style={{ color: 'var(--primary)' }}>{t('landing.heroTitle').split(' ').slice(-2).join(' ')}</span>
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'var(--text-secondary)', fontWeight: 600, mb: 5, maxWidth: 600, lineHeight: 1.6 }}>
                                {t('landing.heroSubtitle')}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    onClick={() => navigate('/login')}
                                    size="large"
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    sx={{
                                        borderRadius: '16px',
                                        px: 4, py: 2,
                                        fontWeight: 900,
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(to right, var(--primary), var(--accent))'
                                    }}
                                >
                                    {t('landing.startRecovery')}
                                </Button>
                                <Button
                                    onClick={() => scrollToSection('features')}
                                    size="large"
                                    variant="outlined"
                                    sx={{
                                        borderRadius: '16px',
                                        px: 4, py: 2,
                                        fontWeight: 900,
                                        borderColor: 'var(--glass-border)',
                                        color: 'var(--text-primary)',
                                        '&:hover': { borderColor: 'var(--primary)' }
                                    }}
                                >
                                    {t('landing.learnMore')}
                                </Button>
                            </Stack>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <Paper className="glass" sx={{
                                p: 1,
                                borderRadius: '40px',
                                position: 'relative',
                                background: 'rgba(255,255,255,0.02)',
                                overflow: 'hidden'
                            }}>
                                <Box component="img"
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba969b6?auto=format&fit=crop&q=80&w=800"
                                    sx={{ width: '100%', borderRadius: '32px', display: 'block' }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 40,
                                    right: -20,
                                    width: 200,
                                    p: 3,
                                    borderRadius: '24px',
                                    bgcolor: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: 'var(--shadow-xl)'
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Speed color="primary" />
                                        <Box>
                                            <Typography variant="caption" fontWeight={900} sx={{ color: 'var(--text-secondary)' }}>{t('landing.trustScore')}</Typography>
                                            <Typography variant="h6" fontWeight={950}>99.2%</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>

            {/* Features Section */}
            <Box id="features" sx={{ py: 20, bgcolor: 'var(--surface)', borderY: '1px solid var(--glass-border)' }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 10 }}>
                        <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: -2, mb: 2, color: 'var(--text-primary)' }}>{t('landing.intelligentEngineering')}</Typography>
                        <Typography variant="h6" color="var(--text-secondary)" fontWeight={600}>{t('landing.engineeringSubtitle')}</Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                                    <Paper sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 'var(--radius-lg)',
                                        bgcolor: 'var(--background)',
                                        border: '1px solid var(--glass-border)',
                                        transition: 'all 0.3s',
                                        boxShadow: 'var(--shadow-md)',
                                        '&:hover': { boxShadow: 'var(--shadow-xl)', borderColor: 'var(--primary)' }
                                    }}>
                                        <Box sx={{
                                            width: 70, height: 70,
                                            borderRadius: 'var(--radius-md)',
                                            bgcolor: `${f.color}15`,
                                            color: f.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            mb: 3
                                        }}>
                                            {f.icon}
                                        </Box>
                                        <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: 'var(--text-primary)' }}>{f.title}</Typography>
                                        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.7 }}>
                                            {f.desc}
                                        </Typography>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* How It Works */}
            <Container id="how-it-works" maxWidth="lg" sx={{ py: 20 }}>
                <Grid container spacing={10} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative' }}>
                            <Box sx={{
                                position: 'absolute',
                                top: -50, left: -50,
                                width: 300, height: 300,
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                                opacity: 0.1,
                                zIndex: 0
                            }} />
                            <Stack spacing={4}>
                                {steps.map((s, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 3, position: 'relative', zIndex: 1 }}>
                                        <Typography variant="h2" sx={{
                                            fontWeight: 950,
                                            color: 'var(--primary)',
                                            opacity: 0.15,
                                            lineHeight: 0.8,
                                            width: 80,
                                            letterSpacing: -4
                                        }}>
                                            {s.id}
                                        </Typography>
                                        <Box>
                                            <Typography variant="h5" fontWeight={950} sx={{ mb: 1, color: 'var(--text-primary)' }}>{s.title}</Typography>
                                            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{s.desc}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: -2, mb: 4 }}>{t('landing.designPath')}</Typography>
                        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '1.2rem', lineHeight: 1.8, mb: 6 }}>
                            {t('landing.designSubtitle')}
                        </Typography>
                        <Button
                            onClick={() => navigate('/login')}
                            variant="contained"
                            size="large"
                            sx={{ borderRadius: '16px', px: 5, py: 2, fontWeight: 900, background: 'var(--primary)' }}
                        >
                            {t('landing.getStarted')}
                        </Button>
                    </Grid>
                </Grid>
            </Container>

            {/* CTA Section */}
            <Box sx={{ py: 15 }}>
                <Container maxWidth="md">
                    <Paper sx={{
                        p: { xs: 6, md: 10 },
                        borderRadius: '60px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: '0 20px 80px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: -2, mb: 3 }}>
                            {t('landing.ctaTitle')}
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, fontWeight: 600 }}>
                            {t('landing.ctaSubtitle')}
                        </Typography>
                        <Button
                            onClick={() => navigate('/login')}
                            size="large"
                            variant="contained"
                            sx={{
                                bgcolor: 'white',
                                color: 'var(--primary)',
                                borderRadius: '20px',
                                px: 6, py: 2.5,
                                fontWeight: 950,
                                fontSize: '1.2rem',
                                '&:hover': { bgcolor: '#f1f1f1', transform: 'scale(1.05)' },
                                transition: 'all 0.3s'
                            }}
                        >
                            {t('landing.ctaButton')}
                        </Button>
                    </Paper>
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ py: 10, borderTop: '1px solid var(--glass-border)' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={8}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{
                                    width: 32, height: 32,
                                    borderRadius: '8px',
                                    background: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <HealthAndSafety sx={{ color: 'white', fontSize: 20 }} />
                                </Box>
                                <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -1 }}>WellBot</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.8 }}>
                                Dedicated to bridging the gap between clinical data and personal health empowerment through advanced AI engineering.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 3 }}>PRODUCT</Typography>
                            <Stack spacing={2}>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Features</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>AI Engine</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Pricing</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 3 }}>COMPANY</Typography>
                            <Stack spacing={2}>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>About Us</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Privacy</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Terms</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 3 }}>CONNECT</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <ChatIcon sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                                <Security sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                                <Devices sx={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default LandingPage;
