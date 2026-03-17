import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Tooltip,
    Avatar,
    Divider,
    Collapse,
    Badge,
    Paper,
    ButtonGroup,
    Button
} from '@mui/material';
import {
    Dashboard as OverviewIcon,
    Psychology as CoachIcon,
    CloudUpload as UploadIcon,
    Assignment as PlanIcon,
    Notifications as RemindersIcon,
    History as HistoryIcon,
    Timeline as TimelineIcon,
    Logout as LogoutIcon,
    ChevronLeft,
    ChevronRight,
    HealthAndSafety,
    ExpandLess,
    ExpandMore,
    AutoGraph,
    FolderShared,
    Translate,
    AdminPanelSettings as AdminIcon,
    People,
    Feedback as FeedbackIcon,
    LightMode,
    DarkMode
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हि' },
    { code: 'te', label: 'తె' },
];

const Sidebar = ({ isCollapsed, onToggle, themeMode, toggleTheme }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [reportsOpen, setReportsOpen] = useState(true);
    let user = {};
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined') {
            const parsed = JSON.parse(storedUser) || {};
            // Flatten keys to lowercase for robust check
            user = Object.keys(parsed).reduce((acc, key) => {
                acc[key.toLowerCase()] = parsed[key];
                return acc;
            }, {});
        }
    } catch (e) {
        console.error("User parse error:", e);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleLangChange = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('wellbot_lang', code);
    };

    const navGroups = user.is_admin ? [
        {
            title: t('sidebar.administrative'),
            items: [
                { text: t('sidebar.overview'), icon: <OverviewIcon />, path: '/admin' },
                { text: t('sidebar.userManagement'), icon: <People />, path: '/admin/users' },
                { text: t('sidebar.systemAnalytics'), icon: <AutoGraph />, path: '/admin/analytics' },
                { text: t('sidebar.chatMonitoring'), icon: <CoachIcon />, path: '/admin/chat-monitoring' },
                { text: t('sidebar.feedbackCenter'), icon: <FeedbackIcon />, path: '/admin/feedback' },
                { text: t('sidebar.reportsLogs'), icon: <HistoryIcon />, path: '/admin/logs' },
                { text: t('sidebar.settings'), icon: <AdminIcon />, path: '/admin/settings' },
            ]
        }
    ] : [
        {
            title: t('sidebar.coreOverview'),
            items: [
                { text: t('sidebar.overview'), icon: <OverviewIcon />, path: '/dashboard' },
            ]
        },
        {
            title: t('sidebar.healthIntelligence'),
            group: t('sidebar.medicalReports'),
            icon: <FolderShared />,
            open: reportsOpen,
            setOpen: setReportsOpen,
            items: [
                { text: t('sidebar.upload'), icon: <UploadIcon />, path: '/upload' },
                { text: t('sidebar.history'), icon: <HistoryIcon />, path: '/history' },
            ]
        },
        {
            title: t('sidebar.actionMonitoring'),
            items: [
                { text: t('sidebar.recoveryPlans'), icon: <PlanIcon />, path: '/plan', badge: 1 },
                { text: t('sidebar.reminders'), icon: <RemindersIcon />, path: '/reminders' },
            ]
        },
        {
            title: t('sidebar.cognitiveLink'),
            items: [
                { text: t('sidebar.coach'), icon: <CoachIcon sx={{ color: 'var(--primary)' }} />, path: '/chat' },
            ]
        }
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(28px)',
                borderRight: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Logo Section */}
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{
                    minWidth: 44,
                    height: 44,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.4)'
                }}>
                    <HealthAndSafety sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                {!isCollapsed && (
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--text-primary)', letterSpacing: -1, lineHeight: 1 }}>
                            WellBot
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: 1 }}>
                            {t('sidebar.intelOs')}
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={toggleTheme} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}>
                    {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>
            </Box>

            <IconButton
                onClick={onToggle}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 40,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    '&:hover': { background: 'var(--surface-hover)' },
                    zIndex: 1001,
                    width: 28,
                    height: 28
                }}
            >
                {isCollapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
            </IconButton>

            {/* Navigation Items */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, '::-webkit-scrollbar': { display: 'none' } }}>
                {navGroups.map((group, gIdx) => (
                    <Box key={gIdx} sx={{ mb: 4 }}>
                        {!isCollapsed && (
                            <Typography variant="caption" sx={{ px: 2, mb: 2, display: 'block', fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: 1.5 }}>
                                {group.title}
                            </Typography>
                        )}

                        {group.group ? (
                            <>
                                <ListItemButton
                                    onClick={() => !isCollapsed && group.setOpen(!group.open)}
                                    sx={{
                                        borderRadius: 'var(--radius-md)',
                                        mb: 0.5,
                                        p: 2,
                                        color: 'var(--text-primary)',
                                        '&:hover': { background: 'var(--surface-hover)' }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, color: 'var(--text-secondary)' }}>{group.icon}</ListItemIcon>
                                    {!isCollapsed && (
                                        <>
                                            <ListItemText primary={group.group} primaryTypographyProps={{ fontWeight: 800, fontSize: '0.9rem' }} />
                                            {group.open ? <ExpandLess /> : <ExpandMore />}
                                        </>
                                    )}
                                </ListItemButton>
                                <Collapse in={group.open && !isCollapsed} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ pl: 2 }}>
                                        {group.items.map((item) => (
                                            <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isActive={location.pathname === item.path} />
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            group.items.map((item) => (
                                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} isActive={location.pathname === item.path} />
                            ))
                        )}
                    </Box>
                ))}
            </Box>

            {/* Language Switcher */}
            {!isCollapsed && (
                <Box sx={{ px: 3, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Translate sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: 1 }}>
                            {t('language')}
                        </Typography>
                    </Box>
                    <ButtonGroup size="small" fullWidth sx={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        {LANGUAGES.map(lang => (
                            <Button
                                key={lang.code}
                                onClick={() => handleLangChange(lang.code)}
                                sx={{
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    border: '1px solid var(--glass-border)',
                                    bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'var(--surface)',
                                    color: i18n.language === lang.code ? 'white' : 'var(--text-secondary)',
                                    '&:hover': { bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'var(--surface-hover)' },
                                    transition: 'all 0.2s',
                                    py: 0.8,
                                }}
                            >
                                {lang.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Box>
            )}
            {isCollapsed && (
                <Box sx={{ px: 1.5, pb: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {LANGUAGES.map(lang => (
                        <Tooltip key={lang.code} title={lang.label} placement="right">
                            <IconButton
                                onClick={() => handleLangChange(lang.code)}
                                size="small"
                                sx={{
                                    borderRadius: 'var(--radius-sm)',
                                    bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'var(--surface)',
                                    color: i18n.language === lang.code ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    '&:hover': { bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'var(--surface-hover)' },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.65rem', lineHeight: 1 }}>
                                    {lang.label}
                                </Typography>
                            </IconButton>
                        </Tooltip>
                    ))}
                </Box>
            )}

            {/* Bottom Profile Section */}
            <Box sx={{ p: 3, mb: 1 }}>
                <Paper
                    onClick={() => navigate('/profile')}
                    sx={{
                        p: 2,
                        borderRadius: 'var(--radius-md)',
                        background: location.pathname === '/profile' ? 'rgba(99, 102, 241, 0.15)' : 'var(--surface)',
                        border: location.pathname === '/profile' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'var(--surface-hover)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'var(--shadow-md)'
                        }
                    }}
                >
                    <Badge variant="dot" color="success" overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        <Avatar sx={{ width: 40, height: 40, background: 'var(--surface)', border: `2px solid var(--primary)` }}>
                            {user.name?.[0] || 'S'}
                        </Avatar>
                    </Badge>
                    {!isCollapsed && (
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: 'var(--text-primary)', noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {user.name || 'User'}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        mt: 2,
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--secondary)',
                        '&:hover': { background: 'rgba(236, 72, 153, 0.1)' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, color: 'inherit' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    {!isCollapsed && <ListItemText primary={t('sidebar.logout')} primaryTypographyProps={{ fontWeight: 800 }} />}
                </ListItemButton>
            </Box>
        </motion.div >
    );
};

const NavItem = ({ item, isCollapsed, isActive }) => (
    <ListItemButton
        component={Link}
        to={item.path}
        sx={{
            borderRadius: 'var(--radius-md)',
            mb: 0.5,
            p: 2,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
            '&:hover': {
                background: 'var(--surface-hover)',
                color: 'var(--text-primary)',
                '& .MuiListItemIcon-root': { color: 'var(--primary)' }
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
    >
        <Tooltip title={isCollapsed ? item.text : ""} placement="right">
            <ListItemIcon sx={{
                minWidth: isCollapsed ? 0 : 40,
                color: isActive ? 'var(--primary)' : 'inherit',
                transition: 'color 0.2s'
            }}>
                {item.icon}
            </ListItemIcon>
        </Tooltip>
        {!isCollapsed && (
            <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                    fontWeight: isActive ? 950 : 700,
                    fontSize: '0.88rem',
                    letterSpacing: isActive ? 0.3 : 0
                }}
            />
        )}
    </ListItemButton>
);

export default Sidebar;
