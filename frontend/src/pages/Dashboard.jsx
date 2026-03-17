import React, { useState, useEffect, useCallback } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    LinearProgress,
    IconButton,
    CircularProgress,
    Button,
    Chip,
    Stack,
    Divider,
    ButtonBase,
    Dialog,
    DialogContent,
    Zoom,
    Avatar,
    Tooltip,
    TextField as MuiTextField,
    Rating
} from '@mui/material';
import {
    WaterDrop,
    FitnessCenter,
    Restaurant,
    Add,
    Remove,
    Celebration,
    Lightbulb,
    Bolt,
    NightsStay as SleepIcon,
    TrendingUp,
    LocalFireDepartment,
    CheckCircle,
    Psychology,
    MonitorHeart,
    Timeline as TimelineIcon,
    AutoGraph,
    Info,
    MonitorWeight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import AnalyticsSection from '../components/AnalyticsSection';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--surface)',
        color: 'var(--text-primary)',
        '& fieldset': { borderColor: 'var(--glass-border)' },
        '&:hover fieldset': { borderColor: 'var(--primary)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
    '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)', opacity: 0.6 }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foodLogs, setFoodLogs] = useState([]);
    const [showCongrats, setShowCongrats] = useState(false);

    const triggerConfetti = useCallback(() => {
        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 60 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } });
        }, 300);
    }, []);

    const fetchFoodLogs = useCallback(async () => {
        try {
            const response = await api.get('/food/logs');
            setFoodLogs(response.data);
        } catch (err) { console.error("Food logs error", err); }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            // Role Guard
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (user && (user.is_admin || user.is_Admin)) {
                window.location.href = '/admin';
                return;
            }

            // Add timestamp to prevent browser caching of streak/progress data
            const response = await api.get(`/dashboard?t=${Date.now()}`);
            const prevData = data;
            setData(response.data);

            // Celebration trigger logic
            if (response.data.is_completed && (!prevData || !prevData.is_completed)) {
                setShowCongrats(true);
                triggerConfetti();
            }

            fetchFoodLogs();
        } catch (error) {
            console.error("Dashboard error:", error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [data, triggerConfetti, fetchFoodLogs]);

    const updateMetric = async (field, amount, isIncrement = true) => {
        // OPTIMISTIC UI: Update the numbers immediately
        setData(prev => {
            if (!prev) return prev;
            const multiplier = isIncrement ? 1 : -1;
            const nextVal = Math.max(0, (field === 'water' ? prev.water_intake : field === 'steps' ? prev.steps : prev.sleep_hours) + (amount * multiplier));

            return {
                ...prev,
                water_intake: field === 'water' ? nextVal : prev.water_intake,
                steps: field === 'steps' ? nextVal : prev.steps,
                sleep_hours: field === 'sleep' ? nextVal : prev.sleep_hours
            };
        });

        try {
            const response = await api.post('/progress/metric', { field, amount, is_increment: isIncrement });
            setData(prev => ({
                ...prev,
                water_intake: response.data.water,
                steps: response.data.steps,
                sleep_hours: response.data.sleep,
                health_score: response.data.recovery_score,
                is_completed: response.data.recovery_score >= 100,
                health_streak: response.data.health_streak
            }));
            if (response.data.just_completed) {
                setShowCongrats(true);
                triggerConfetti();
            }
        } catch (error) {
            console.error("Metric update error", error);
            fetchData(); // Rollback if error
        }
    };

    const logFood = async (item, isSuggestion = false) => {
        // Optimistic score boost simulation
        setData(prev => prev ? ({ ...prev, health_score: Math.min(100, prev.health_score + 2) }) : prev);

        try {
            await api.post('/food/log', { food_item: item, category: 'Nutritional Intake', is_healthy: true, is_suggestion: isSuggestion });
            fetchData();
        } catch (err) {
            console.error("Food log error", err);
            fetchData();
        }
    };


    useEffect(() => { fetchData(); }, [fetchData]);

    const [calendar, setCalendar] = useState([]);
    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const res = await api.get('/streak-calendar');
                setCalendar(res.data);
            } catch (err) { console.error(err); }
        };
        fetchCalendar();
    }, [data?.health_score]);

    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const handleFeedbackSubmit = async () => {
        if (!feedback.trim()) return;
        try {
            await api.post('/feedback', { message: feedback, rating: rating });
            setFeedbackSent(true);
            setFeedback('');
        } catch (err) { console.error(err); }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
    if (!data) return <Box sx={{ p: 4 }} align="center"><Typography color="error" variant="h6">{error}</Typography><Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>{t('common.refresh')}</Button></Box>;

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: { xs: 2, md: 4 } }}>
            {/* 1. HEADER SECTION */}
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-3px', color: 'var(--text-primary)' }}>
                        {t('dashboard.wellbotOs')}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'var(--text-secondary)', fontWeight: 700, opacity: 0.8 }}>
                        {t('dashboard.welcomeBack')} {data.user_name}. {t('dashboard.healthIntelligenceActive')}
                    </Typography>
                </Box>
                <Paper className="glass-card" sx={{ px: 3, py: 1.5, borderRadius: 'var(--radius-lg)', display: 'flex', gap: 4 }}>
                    <Box textAlign="center">
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: 1.5 }}>{t('dashboard.healthStreak')}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                            <Celebration sx={{ color: '#10b981', fontSize: 20 }} />
                            <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)' }}>{data.health_streak} {t('dashboard.days')}</Typography>
                        </Stack>
                    </Box>
                </Paper>
            </Box>

            {/* 2. CORE INTELLIGENCE ROW */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Paper className="glass-card" sx={{
                            p: 6,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 'var(--radius-xl)',
                            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15), rgba(167, 139, 250, 0.05))',
                            border: '1px solid var(--primary)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={data.health_score}
                                    size={180}
                                    thickness={6}
                                    sx={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 15px var(--primary))' }}
                                />
                                <Box textAlign="center" sx={{ position: 'absolute' }}>
                                    <Typography variant="h2" sx={{ fontWeight: 950, color: 'var(--text-primary)', lineHeight: 1 }}>{data.health_score}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--text-secondary)', letterSpacing: 2 }}>{t('dashboard.index')}</Typography>
                                </Box>
                            </Box>
                            <Typography variant="h5" fontWeight={900} sx={{ mb: 1, color: 'var(--text-primary)' }}>
                                {data.health_score >= 80 ? t('dashboard.optimal') :
                                    data.health_score >= 60 ? t('dashboard.moderate') :
                                        data.health_score >= 40 ? t('dashboard.healthRisk') : t('dashboard.criticalAlert')}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{t('dashboard.overallScore')}</Typography>
                        </Paper>
                    </motion.div>
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <MetricTracker
                                icon={<WaterDrop />}
                                label={t('dashboard.hydrationPlan')}
                                value={data.water_intake}
                                target={data.target_water}
                                unit="ml"
                                increment={200}
                                onAdd={() => updateMetric('water', 200)}
                                onRemove={() => updateMetric('water', 200, false)}
                                color="#0ea5e9"
                                t={t}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <MetricTracker
                                icon={<FitnessCenter />}
                                label={t('dashboard.activityGoal')}
                                value={data.steps}
                                target={data.target_steps}
                                unit="steps"
                                increment={1000}
                                onAdd={() => updateMetric('steps', 1000)}
                                onRemove={() => updateMetric('steps', 1000, false)}
                                color="#f59e0b"
                                t={t}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <MetricTracker
                                icon={<SleepIcon />}
                                label={t('dashboard.circadianSleep')}
                                value={data.sleep_hours}
                                target={data.target_sleep}
                                unit="hrs"
                                increment={0.5}
                                onAdd={() => updateMetric('sleep', 0.5)}
                                onRemove={() => updateMetric('sleep', 0.5, false)}
                                color="#6366f1"
                                t={t}
                            />
                        </Grid>

                        <Grid item size={{ xs: 12 }}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Paper elevation={0} sx={{
                                    p: 3.5,
                                    mt: 3,
                                    borderRadius: '18px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { transform: 'translateY(-5px)', borderColor: 'var(--primary)', boxShadow: 'var(--shadow-lg)' }
                                }}>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '15px',
                                            background: 'linear-gradient(135deg, var(--primary), #ec4899)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                                        }}>
                                            <MonitorWeight sx={{ color: 'white', fontSize: 32 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 950, letterSpacing: 2, display: 'block', mb: 0.5 }}>{t('dashboard.bmiMonitoring')}</Typography>
                                            <Stack direction="row" spacing={2} alignItems="baseline">
                                                <Typography variant="h4" fontWeight={950} sx={{ color: 'var(--text-primary)', letterSpacing: -1 }}>
                                                    {data.bmi_value || 'N/A'}
                                                </Typography>
                                                <Typography variant="body1" fontWeight={800} color="var(--primary)">
                                                    {data.bmi_category || t('dashboard.pendingData')}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 900, mb: 1, display: 'block' }}>{t('dashboard.recoveryGoal')}</Typography>
                                        <Typography variant="body2" fontWeight={900} sx={{
                                            color: data.bmi_category === 'Underweight' ? '#0ea5e9' :
                                                data.bmi_category === 'Normal' ? '#22c55e' :
                                                    data.bmi_category === 'Overweight' ? '#f59e0b' :
                                                        data.bmi_category === 'Obese' ? '#ef4444' : 'var(--text-secondary)',
                                            mb: 2,
                                            fontSize: '1.1rem'
                                        }}>
                                            {data.bmi_category === 'Underweight' ? t('dashboard.weightGainProgram') :
                                                data.bmi_category === 'Normal' ? t('dashboard.healthMaintenance') :
                                                    data.bmi_category === 'Overweight' ? t('dashboard.weightReduction') :
                                                        data.bmi_category === 'Obese' ? t('dashboard.fatReductionStrategy') : t('dashboard.updateProfileToInitialize')}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => navigate('/plan')}
                                            sx={{ borderRadius: '10px', fontWeight: 900, px: 3, py: 1, background: 'var(--primary)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
                                        >
                                            {t('dashboard.viewDietStrategy')}
                                        </Button>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>

            {/* 4. INTELLIGENCE MATRIX ROW (Precise Pixel-Balanced Layout) */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    md: '240px 1fr 220px',
                    sm: '1fr',
                    xs: '1fr'
                },
                gap: 3,
                mb: 6,
                alignItems: 'stretch'
            }}>
                {/* PART A: LEFT SIDEBAR (Intelligence Stack) */}
                <Stack spacing={2.5} sx={{ height: '100%' }}>
                    {/* AI Wisdom Widget */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: '18px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            <Lightbulb sx={{ color: '#f59e0b', fontSize: 18 }} /> {t('dashboard.aiAdvice')}
                        </Typography>
                        <Stack spacing={1.2}>
                            {(data.ai_suggestions || ['Stay hydrated', 'Keep moving', 'Maintain healthy diet']).slice(0, 3).map((s, i) => (
                                <Box key={i} sx={{ p: 1.5, bgcolor: 'var(--background)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', transition: '0.3s', '&:hover': { borderColor: 'var(--primary)', transform: 'translateX(4px)' } }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1.4, fontSize: '0.78rem' }}>{s}</Typography>
                                </Box>
                            ))}
                            {data.medical_plan?.has_plan && (
                                <Box sx={{ mt: 0.5, p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.06)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 950, color: '#10b981', fontSize: '0.65rem', mb: 0.5, display: 'block' }}>{t('dashboard.strategicDos')}</Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.72rem', lineHeight: 1.3, display: 'block' }}>
                                        {data.medical_plan.dos?.length > 80 ? data.medical_plan.dos.substring(0, 80) + '...' : data.medical_plan.dos}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>

                    {/* Streak Progression Widget */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: '18px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'var(--shadow-md)',
                            flex: 1,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            <TimelineIcon sx={{ fontSize: 18, color: 'var(--primary)' }} /> {t('dashboard.progression')}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
                            {(calendar || []).slice(-20).map((day, i) => (
                                <Tooltip key={i} title={day.date} arrow>
                                    <Box sx={{
                                        width: '100%',
                                        pt: '100%',
                                        borderRadius: '6px',
                                        bgcolor: day.completed ? '#10b981' : (day.missed ? '#4b5563' : 'var(--glass-border)'),
                                        boxShadow: day.completed ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                                        opacity: day.missed ? 0.6 : 1,
                                        transition: 'all 0.3s ease',
                                        '&:hover': { transform: 'scale(1.2)', zIndex: 10, cursor: 'pointer', borderRadius: '4px' }
                                    }} />
                                </Tooltip>
                            ))}
                        </Box>
                        {(!calendar || calendar.length === 0) && (
                            <Typography variant="caption" sx={{ opacity: 0.5, textAlign: 'center', display: 'block', mt: 2 }}>{t('dashboard.noActivityRecorded')}</Typography>
                        )}
                    </Paper>
                </Stack>

                {/* PART B: CENTRAL HUB (Food Center) */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: '18px',
                        height: '100%',
                        minHeight: '500px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 950, mb: 4, display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        <Restaurant sx={{ color: '#10b981', fontSize: 28 }} /> {t('dashboard.foodIntakeCenter')}
                    </Typography>

                    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {['Oatmeal', 'Berries', 'Walnuts', 'Turmeric', 'Chia Seeds', 'Flax Seeds', 'Ginger', 'Green Tea', 'Spinach', 'Almonds', 'Yogurt', 'Salmon', 'Avocado', 'Quinoa', 'Sweet Potato', 'Lentils'].map(item => (
                            <ButtonBase
                                key={item}
                                onClick={() => logFood(item, true)}
                                sx={{
                                    px: 2.2, py: 1.2,
                                    bgcolor: 'rgba(16, 185, 129, 0.08)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)', transform: 'translateY(-3px)', borderColor: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }
                                }}
                            >
                                <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.8rem', color: '#10b981' }}>
                                    {t(`dashboard.foodItems.${item}`)}
                                </Typography>
                            </ButtonBase>
                        ))}
                    </Box>

                    <Divider sx={{ mb: 4, opacity: 0.1 }} />

                    <Typography variant="caption" sx={{ fontWeight: 950, color: 'var(--text-secondary)', mb: 2.5, display: 'block', letterSpacing: 2, fontSize: '0.75rem' }}>{t('dashboard.protocolLogsHistory')}</Typography>

                    <Stack spacing={2}>
                        {foodLogs.length > 0 ? foodLogs.slice(0, 6).map((l, idx) => (
                            <motion.div key={l.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2.5,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    transition: '0.2s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(16, 185, 129, 0.3)', transform: 'scale(1.01)' }
                                }}>
                                    <Typography variant="body2" fontWeight={800} fontSize="1rem" color="var(--text-primary)">{l.food_item}</Typography>
                                    <Stack direction="row" spacing={2.5} alignItems="center">
                                        <Chip
                                            label={t('dashboard.healthyChoice')}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.75rem',
                                                bgcolor: 'rgba(16, 185, 129, 0.12)',
                                                color: '#10b981',
                                                fontWeight: 900,
                                                borderRadius: '8px',
                                                border: '1px solid rgba(16, 185, 129, 0.2)'
                                            }}
                                        />
                                        <Typography variant="caption" fontSize="0.8rem" sx={{ color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.8 }}>
                                            {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </motion.div>
                        )) : (
                            <Box sx={{ py: 6, textAlign: 'center', opacity: 0.5 }}>
                                <Typography variant="body2">{t('dashboard.noLogsToday')}</Typography>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* PART C: RIGHT SIDEBAR (Feedback Section) */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3.5,
                        borderRadius: '18px',
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 950, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        <Info sx={{ color: 'var(--primary)', fontSize: 22 }} /> {t('dashboard.userExperience')}
                    </Typography>
                    {feedbackSent ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <CheckCircle sx={{ fontSize: 50, color: '#10b981', mb: 2.5 }} />
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 950, letterSpacing: 1.5, color: '#10b981' }}>{t('dashboard.sentSuccessfully')}</Typography>
                        </Box>
                    ) : (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--text-secondary)', mb: 1.5, display: 'block', letterSpacing: 1 }}>{t('dashboard.experienceRating')}</Typography>
                                <Rating
                                    size="large"
                                    value={rating}
                                    onChange={(e, v) => setRating(v)}
                                    sx={{ color: '#6366f1', fontSize: '2.2rem' }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--text-secondary)', mb: 1.5, display: 'block', letterSpacing: 1 }}>{t('dashboard.dailyObservations')}</Typography>
                                <MuiTextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    size="small"
                                    placeholder={t('dashboard.feelingTodayPlaceholder')}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    sx={{
                                        ...textFieldStyle,
                                        '& .MuiInputBase-root': { borderRadius: '12px' },
                                        '& .MuiInputBase-input': { fontSize: '0.85rem' }
                                    }}
                                />
                            </Box>

                            <Button
                                size="large"
                                variant="contained"
                                fullWidth
                                onClick={handleFeedbackSubmit}
                                sx={{
                                    borderRadius: '14px',
                                    fontWeight: 950,
                                    py: 1.5,
                                    letterSpacing: 2,
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                                    '&:hover': { transform: 'scale(1.02)', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)' }
                                }}
                            >
                                {t('dashboard.submitReport')}
                            </Button>
                        </Stack>
                    )}
                </Paper>
            </Box>

            {/* 3. TRENDS & PREDICTIONS */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-lg)', minHeight: 400 }}>
                        <Typography variant="h6" sx={{ fontWeight: 950, mb: 4, display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-primary)' }}>
                            <TrendingUp sx={{ color: 'var(--primary)' }} /> {t('dashboard.longitudinalAnalysis')}
                        </Typography>
                        <AnalyticsSection />
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={3}>
                        <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-lg)', borderLeft: `6px solid ${data.risk_level === 'Healthy' ? '#10b981' : '#f43f5e'}` }}>
                            <Typography variant="h6" sx={{ fontWeight: 950, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, color: 'var(--text-primary)' }}>
                                <MonitorHeart sx={{ color: data.risk_level === 'Healthy' ? '#10b981' : '#f43f5e' }} /> {t('dashboard.riskPredictor')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{
                                    px: 2.5, py: 1,
                                    borderRadius: '12px',
                                    bgcolor: data.risk_level === 'Healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                    color: data.risk_level === 'Healthy' ? '#10b981' : '#f43f5e',
                                    fontWeight: 900,
                                    boxShadow: data.risk_level === 'Healthy' ? '0 0 10px rgba(16, 185, 129, 0.2)' : '0 0 10px rgba(244, 63, 94, 0.2)'
                                }}>
                                    {data.risk_level === 'Healthy' ? t('dashboard.healthy') : data.risk_level?.toUpperCase()}
                                </Box>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                                    {data.risk_description}
                                </Typography>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>

            {/* STREAK CELEBRATION MODAL */}
            <Dialog
                open={showCongrats}
                onClose={() => setShowCongrats(false)}
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: 'var(--radius-xl)',
                        bgcolor: 'var(--background)',
                        backgroundImage: 'none',
                        border: '1px solid var(--primary)',
                        padding: 2.5,
                        textAlign: 'center',
                        maxWidth: 340,
                        position: 'relative',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogContent sx={{ p: 2 }}>
                    <Box sx={{ position: 'absolute', top: -30, left: -30, width: 150, height: 150, bgcolor: 'var(--primary)', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />
                    <Box sx={{ mb: 3, position: 'relative' }}>
                        <Celebration sx={{ fontSize: 80, color: '#f59e0b', filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.4))' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={950} sx={{ mb: 0.5, letterSpacing: '-0.5px', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {t('dashboard.congratulations')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#10b981', mb: 2, fontWeight: 950 }}>
                        {data?.health_streak || 1} {t('dashboard.streakAchieved')}
                    </Typography>

                    <Box sx={{ p: 3, bgcolor: 'var(--surface)', borderRadius: 'var(--radius-md)', mb: 4, borderLeft: '4px solid var(--primary)' }}>
                        <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--text-primary)', mb: 1 }}>
                            "{t('dashboard.whoQuote')}"
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>— {t('dashboard.whoAuthor')}</Typography>
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setShowCongrats(false)}
                        sx={{
                            borderRadius: '16px',
                            py: 2.5,
                            fontWeight: 950,
                            letterSpacing: 2,
                            bgcolor: 'var(--primary)',
                            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                            transition: '0.3s',
                            '&:hover': { bgcolor: 'var(--primary)', transform: 'translateY(-3px)', boxShadow: '0 16px 40px rgba(99, 102, 241, 0.5)' }
                        }}
                    >
                        {t('dashboard.continueRecovery')}
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

const MetricTracker = ({ icon, label, value, target, unit, onAdd, onRemove, color, t }) => (
    <motion.div whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Paper className="glass-card" sx={{ p: 3.5, borderRadius: 'var(--radius-lg)', borderLeft: `8px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
                <Box sx={{ p: 1.8, borderRadius: 'var(--radius-md)', bgcolor: `${color}15`, color, display: 'flex', boxShadow: `0 8px 16px ${color}10` }}>
                    {React.cloneElement(icon, { sx: { fontSize: 24 } })}
                </Box>
                <Typography variant="subtitle1" fontWeight={950} sx={{ color: 'var(--text-primary)' }}>{label}</Typography>
            </Box>

            <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
                    <Typography variant="h3" fontWeight={950} sx={{ color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</Typography>
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 800 }}>/ {target} {unit}</Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="contained"
                        onClick={onAdd}
                        startIcon={<Add />}
                        sx={{
                            flex: 1,
                            bgcolor: color,
                            color: 'white',
                            fontWeight: 900,
                            borderRadius: '12px',
                            py: 1,
                            fontSize: '0.75rem',
                            boxShadow: `0 4px 12px ${color}30`,
                            '&:hover': { bgcolor: color, transform: 'translateY(-2px)' }
                        }}
                    >
                        {t('dashboard.log')} {unit.toUpperCase()}
                    </Button>
                    <IconButton
                        onClick={onRemove}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-primary)',
                            borderRadius: '12px',
                            px: 2,
                            border: '1px solid rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Remove />
                    </IconButton>
                </Stack>
            </Box>

            <Box sx={{ mb: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min((value / target) * 100, 100)}
                    sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'var(--glass-border)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: color,
                            borderRadius: 6,
                            boxShadow: `0 0 10px ${color}80`
                        }
                    }}
                />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>
                    {t('dashboard.compliance').toUpperCase()}: {Math.round(Math.min((value / target) * 100, 100))}%
                </Typography>
                <Chip
                    label={value >= target ? t('dashboard.goalAchieved') : t('dashboard.inProgress')}
                    size="small"
                    sx={{
                        fontSize: '0.65rem',
                        fontWeight: 950,
                        bgcolor: value >= target ? 'rgba(16, 185, 129, 0.15)' : 'var(--glass-border)',
                        color: value >= target ? '#10b981' : 'var(--text-secondary)',
                        border: value >= target ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--glass-border)'
                    }}
                />
            </Box>
        </Paper>
    </motion.div>
);

export default Dashboard;
