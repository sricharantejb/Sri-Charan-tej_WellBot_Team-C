import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
    Button,
    Stack,
    Avatar,
    TextField
} from '@mui/material';
import {
    CheckCircleOutline,
    Restaurant,
    FitnessCenter,
    SelfImprovement,
    Add,
    AutoGraph,
    TrackChanges,
    LightbulbCircle,
    ArrowForwardIos,
    Spa,
    CheckCircle
} from '@mui/icons-material';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';

const Plan = () => {
    const { t } = useTranslation();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [todayProgress, setTodayProgress] = useState(null);
    const [pasteContent, setPasteContent] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [dietTab, setDietTab] = useState('veg');

    const handleClearPlan = async () => {
        if (!window.confirm(t('plan.clearConfirm'))) return;
        try {
            await api.post('/plan/clear');
            setPlan(null);
            setTodayProgress(prev => ({
                ...prev,
                diet_tasks: [],
                exercise_tasks: [],
                health_score: 0
            }));
            alert(t('plan.clearSuccess'));
        } catch (err) {
            console.error("Clear plan error:", err);
            alert(t('plan.clearFailed'));
        }
    };

    const handlePasteAnalyze = async () => {
        setAnalyzing(true);
        try {
            await api.post('/plan/analyze-paste', { text: pasteContent });
            setPasteContent('');
            await fetchPlan();
            alert(t('plan.integrateSuccess'));
        } catch (err) {
            console.error(err);
            alert(t('plan.integrateFailed'));
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchPlan = async () => {
        try {
            const [planRes, progRes] = await Promise.all([
                api.get('/plan'),
                api.get('/dashboard')
            ]);
            setPlan(planRes.data);
            setTodayProgress(progRes.data);
        } catch (error) {
            console.error("Plan fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlan(); }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    if (!plan) return <Box sx={{ p: 4 }}><Typography>{t('plan.noPlans')}</Typography></Box>;

    const toggleTask = async (type, taskId) => {
        try {
            const response = await api.post('/tasks/toggle', { task_id: taskId, type });
            setTodayProgress(prev => ({
                ...prev,
                [`${type}_tasks`]: response.data.tasks,
                health_score: response.data.recovery_score
            }));
        } catch (err) { console.error("Task toggle error:", err); }
    };

    const logIntake = async (item) => {
        try {
            await api.post('/food/log', {
                food_item: item,
                category: 'Suggested Recovery Intake',
                is_healthy: true,
                is_suggestion: true
            });
            fetchPlan(); // Refresh progress
        } catch (err) { console.error("Food log error:", err); }
    };


    const vegTasks = Array.isArray(plan.veg_diet) ? plan.veg_diet : JSON.parse(plan.veg_diet || '[]');
    const nonVegTasks = Array.isArray(plan.non_veg_diet) ? plan.non_veg_diet : JSON.parse(plan.non_veg_diet || '[]');
    const exerciseTasks = Array.isArray(plan.exercise_plan) ? plan.exercise_plan : JSON.parse(plan.exercise_plan || '[]');
    const naturalRemedies = Array.isArray(plan.natural_remedies) ? plan.natural_remedies : JSON.parse(plan.natural_remedies || '[]');

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: '-2.5px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {t('plan.recoveryProtocol')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {t('plan.synthesizedIntelligence')}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleClearPlan}
                    sx={{
                        borderRadius: '16px',
                        fontWeight: 900,
                        borderWidth: '2px',
                        px: 3,
                        '&:hover': { borderWidth: '2px', bgcolor: 'rgba(244, 63, 94, 0.05)' }
                    }}
                >
                    {t('plan.clearProtocol')}
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* ROW 1: Nutrition & Movement */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderRadius: '32px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4, justifyContent: 'space-between' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 56, height: 56, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                    <Restaurant sx={{ fontSize: 28 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)', letterSpacing: -0.5 }}>{t('plan.nutritionalArchitecture')}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t('plan.biometricFueling')}</Typography>
                                        {todayProgress?.bmi_category && (
                                            <Box sx={{
                                                px: 1,
                                                py: 0.1,
                                                borderRadius: '4px',
                                                fontSize: '9px',
                                                fontWeight: 950,
                                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                                color: 'var(--primary)',
                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                letterSpacing: 0.5
                                            }}>
                                                {todayProgress.bmi_category.toUpperCase()} {t('plan.protocolLabel')}
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>

                            <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(0,0,0,0.2)', p: 0.75, borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Button
                                    size="small"
                                    onClick={() => setDietTab('veg')}
                                    sx={{
                                        borderRadius: '12px',
                                        fontWeight: 900,
                                        px: 2,
                                        bgcolor: dietTab === 'veg' ? 'var(--success)' : 'transparent',
                                        color: 'white',
                                        '&:hover': { bgcolor: dietTab === 'veg' ? 'var(--success)' : 'rgba(255,255,255,0.1)' }
                                    }}
                                >{t('plan.veg')}</Button>
                                <Button
                                    size="small"
                                    onClick={() => setDietTab('nonveg')}
                                    sx={{
                                        borderRadius: '12px',
                                        fontWeight: 900,
                                        px: 2,
                                        bgcolor: dietTab === 'nonveg' ? '#ef4444' : 'transparent',
                                        color: 'white',
                                        '&:hover': { bgcolor: dietTab === 'nonveg' ? '#ef4444' : 'rgba(255,255,255,0.1)' }
                                    }}
                                >{t('plan.nonVeg')}</Button>
                            </Box>
                        </Stack>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={dietTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {(dietTab === 'veg' ? vegTasks : nonVegTasks).map((taskItem, i) => {
                                        const taskText = taskItem.task || taskItem;
                                        const taskId = taskItem.id || taskText;
                                        const isDone = todayProgress?.diet_tasks?.find(progTask => (progTask.id === taskId || progTask.task === taskId) && progTask.completed);

                                        return (
                                            <ListItem
                                                key={i}
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: '20px',
                                                    bgcolor: isDone ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    border: `1px solid ${isDone ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer',
                                                    '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateX(4px)' }
                                                }}
                                                onClick={() => toggleTask('diet', taskId)}
                                            >
                                                <ListItemIcon sx={{ minWidth: 44 }}>
                                                    {isDone ? <CheckCircle sx={{ color: '#22c55e', fontSize: 28 }} /> : <CheckCircleOutline sx={{ opacity: 0.2, fontSize: 28 }} />}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={taskText}
                                                    primaryTypographyProps={{
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                        sx: { textDecoration: isDone ? 'line-through' : 'none' }
                                                    }}
                                                />
                                                {!isDone && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={(e) => { e.stopPropagation(); logIntake(taskText); }}
                                                        sx={{
                                                            borderRadius: '12px',
                                                            fontWeight: 900,
                                                            fontSize: '0.7rem',
                                                            bgcolor: dietTab === 'veg' ? 'var(--success)' : '#ef4444',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                            '&:hover': { transform: 'scale(1.05)' }
                                                        }}
                                                    >
                                                        {t('dashboard.log')}
                                                    </Button>
                                                )}
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </motion.div>
                        </AnimatePresence>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderRadius: '32px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                            <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', width: 56, height: 56, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <FitnessCenter sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)', letterSpacing: -0.5 }}>{t('plan.movementProtocol')}</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t('plan.kineticsFlow')}</Typography>
                            </Box>
                        </Stack>
                        <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {exerciseTasks.map((exerciseItem, i) => {
                                const taskText = exerciseItem.task || exerciseItem;
                                const taskId = exerciseItem.id || taskText;
                                const isDone = todayProgress?.exercise_tasks?.find(progTask => (progTask.id === taskId || progTask.task === taskId) && progTask.completed);

                                return (
                                    <ListItem
                                        key={i}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '20px',
                                            bgcolor: isDone ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${isDone ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateX(4px)' }
                                        }}
                                        onClick={() => toggleTask('exercise', taskId)}
                                    >
                                        <ListItemIcon sx={{ minWidth: 44 }}>
                                            {isDone ? <CheckCircle sx={{ color: 'var(--primary)', fontSize: 28 }} /> : <CheckCircleOutline sx={{ opacity: 0.2, fontSize: 28 }} />}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={taskText}
                                            primaryTypographyProps={{
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                sx: { textDecoration: isDone ? 'line-through' : 'none' }
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LightbulbCircle sx={{ color: 'var(--primary)', fontSize: 20 }} />
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--primary)', letterSpacing: 1, textTransform: 'uppercase' }}>{t('plan.coachInsight')}</Typography>
                            </Stack>
                            <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 1, fontWeight: 600 }}>{t('plan.stretchingAdvice')}</Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* ROW 2: Wellness & Guardrails */}
                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderRadius: '32px',
                            background: 'rgba(16, 185, 129, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(16, 185, 129, 0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                            <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 56, height: 56, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Spa sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)', letterSpacing: -0.5 }}>{t('plan.naturalWellness')}</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t('plan.homeostaticSupport')}</Typography>
                            </Box>
                        </Stack>
                        <Grid container spacing={2}>
                            {naturalRemedies.map((remedy, i) => (
                                <Grid item xs={12} sm={6} key={i}>
                                    <Paper sx={{
                                        p: 3,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }
                                    }}>
                                        <LightbulbCircle sx={{ color: '#10b981', fontSize: 20 }} />
                                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--text-primary)' }}>{remedy.task || remedy}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            height: '100%',
                            borderRadius: '32px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', width: 56, height: 56, border: '1px solid rgba(255,255,255,0.1)' }}>
                                <TrackChanges sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)', letterSpacing: -0.5 }}>{t('plan.clinicalGuardrails')}</Typography>
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{t('plan.dosDonts')}</Typography>
                            </Box>
                        </Stack>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    bgcolor: 'rgba(34, 197, 94, 0.05)',
                                    border: '1px solid rgba(34, 197, 94, 0.1)',
                                    height: '100%'
                                }}>
                                    <Typography variant="subtitle2" fontWeight={900} color="#22c55e" sx={{ mb: 2, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('plan.positiveAction')}</Typography>
                                    <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{plan.dos}</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{
                                    p: 3,
                                    borderRadius: '24px',
                                    bgcolor: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.1)',
                                    height: '100%'
                                }}>
                                    <Typography variant="subtitle2" fontWeight={900} color="#ef4444" sx={{ mb: 2, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t('plan.protocolRisks')}</Typography>
                                    <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{plan.donts}</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* PASTE SECTION: Moved to bottom as a support feature */}
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: '32px',
                            background: 'rgba(99, 102, 241, 0.02)',
                            border: '2px dashed rgba(99, 102, 241, 0.2)',
                            mt: 2
                        }}
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={900} mb={1} sx={{ color: 'var(--text-primary)' }}>{t('plan.protocolSynchronization')}</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600, mb: 3 }}>
                                    {t('plan.integrateExternal')}
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder={t('plan.pastePlaceholder')}
                                    value={pasteContent}
                                    onChange={(e) => setPasteContent(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            bgcolor: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' }
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handlePasteAnalyze}
                                    disabled={analyzing || !pasteContent.trim()}
                                    startIcon={analyzing ? <CircularProgress size={20} /> : <AutoGraph />}
                                    sx={{ mt: 2, borderRadius: '12px', fontWeight: 900, px: 6, py: 1.5 }}
                                >
                                    {analyzing ? t('plan.synchronizing') : t('plan.injectProtocol')}
                                </Button>
                            </Box>
                            <Avatar sx={{ width: 120, height: 120, bgcolor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <AutoGraph sx={{ fontSize: 60, color: 'var(--primary)', opacity: 0.5 }} />
                            </Avatar>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Plan;
