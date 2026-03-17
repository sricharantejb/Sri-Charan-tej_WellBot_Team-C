import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Stack,
    IconButton,
    CircularProgress,
    Tooltip,
    Badge,
    Collapse,
    Divider,
    Button,
    Avatar
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Description,
    HealthAndSafety,
    Event,
    AssignmentInd,
    FlashOn,
    MonitorHeart
} from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line

const API_URL = 'http://localhost:5100/api';

const Timeline = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [adherence, setAdherence] = useState({});

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const [reportsRes, diagRes] = await Promise.all([
                axios.get(`${API_URL}/reports`, { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get(`${API_URL}/diagnoses`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            // Normalize events
            const allEvents = [
                ...reportsRes.data.map(r => ({ ...r, type: 'report', date: new Date(r.upload_time) })),
                ...diagRes.data.map(d => ({ ...d, type: 'diagnosis', date: new Date(d.diagnosed_date) }))
            ];
            setEvents(allEvents);

            // Fetch adherence for current month
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const adherenceRes = await axios.get(`${API_URL}/history/adherence?month=${month}&year=${year}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAdherence(adherenceRes.data);
        } catch (error) {
            console.error("Timeline Error:", error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const startDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
        setSelectedDayEvents(null);
    };

    const getDayEvents = (day) => {
        return events.filter(e =>
            e.date.getDate() === day &&
            e.date.getMonth() === currentDate.getMonth() &&
            e.date.getFullYear() === currentDate.getFullYear()
        );
    };

    const getSeverityColor = (sev) => {
        switch (sev?.toLowerCase()) {
            case 'critical': return '#ef4444';
            case 'moderate': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return 'var(--primary)';
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = startDayOfMonth(year, month);
        const calendar = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            calendar.push(<Box key={`pad-${i}`} sx={{ p: 2, bgcolor: 'transparent' }} />);
        }

        for (let d = 1; d <= totalDays; d++) {
            const dayEvents = getDayEvents(d);
            const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            calendar.push(
                <Box
                    key={d}
                    onClick={() => dayEvents.length > 0 && setSelectedDayEvents({ day: d, events: dayEvents })}
                    sx={{
                        p: 2,
                        minHeight: 110,
                        border: '1px solid var(--glass-border)',
                        bgcolor: isToday ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', transform: 'scale(1.02)', zIndex: 10 },
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    {adherence && adherence[d] > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: `${adherence[d]}%`,
                            background: `linear-gradient(to top, ${adherence[d] > 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.05)'}, transparent)`,
                            zIndex: 0,
                            pointerEvents: 'none'
                        }} />
                    )}
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: isToday ? 'var(--primary)' : 'var(--text-secondary)' }}>{d}</Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                            {dayEvents.map((e, idx) => (
                                <Tooltip key={idx} title={`${e.type.toUpperCase()}: ${e.name || 'Medical Report'}`}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: e.type === 'report' ? 'var(--primary)' : getSeverityColor(e.severity),
                                        boxShadow: `0 0 5px ${e.type === 'report' ? 'var(--primary)' : getSeverityColor(e.severity)}`
                                    }} />
                                </Tooltip>
                            ))}
                        </Stack>
                        {(adherence[d] !== undefined) && (
                            <Typography variant="caption" sx={{
                                fontSize: '9px',
                                fontWeight: 900,
                                color: adherence[d] > 80 ? 'var(--success)' : 'var(--text-secondary)',
                                mt: 1,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {adherence[d]}% COMP
                            </Typography>
                        )}
                    </Box>
                </Box>
            );
        }

        return calendar;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {t('timeline.title')}
                    </Typography>
                    <Typography variant="body1" color="var(--text-secondary)">
                        {t('timeline.subtitle')}
                    </Typography>
                </Box>
                <Paper className="glass-card" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton size="small" onClick={() => changeMonth(-1)}><ChevronLeft /></IconButton>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ minWidth: 150, textAlign: 'center' }}>
                        {currentDate.toLocaleString(t('language_code') || 'default', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton size="small" onClick={() => changeMonth(1)}><ChevronRight /></IconButton>
                </Paper>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} lg={selectedDayEvents ? 8 : 12} sx={{ transition: '0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                    <Paper className="glass-card" sx={{ p: 0, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <Grid container columns={7} sx={{ bgcolor: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--glass-border)' }}>
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                                <Grid item key={day} sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{day}</Typography>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                            {renderCalendar()}
                        </Box>
                    </Paper>
                </Grid>

                {/* Event Sidebar (Dynamic) */}
                <AnimatePresence>
                    {selectedDayEvents && (
                        <Grid item xs={12} lg={4}>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <Paper className="glass-card" sx={{ p: 4, height: '100%', position: 'relative' }}>
                                    <IconButton onClick={() => setSelectedDayEvents(null)} sx={{ position: 'absolute', right: 16, top: 16 }}><ChevronRight /></IconButton>
                                    <Typography variant="h6" fontWeight={900} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Event sx={{ color: 'var(--primary)' }} /> {t('timeline.events')}: {selectedDayEvents.day} {currentDate.toLocaleString(t('language_code') || 'default', { month: 'short' })}
                                    </Typography>

                                    <Stack spacing={3}>
                                        {selectedDayEvents.events.map((e, idx) => (
                                            <Box key={idx} sx={{ p: 3, borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                    <Avatar sx={{ bgcolor: `${e.type === 'report' ? 'var(--primary)' : getSeverityColor(e.severity)}15`, color: e.type === 'report' ? 'var(--primary)' : getSeverityColor(e.severity) }}>
                                                        {e.type === 'report' ? <Description /> : <HealthAndSafety />}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={800}>{e.name || t('timeline.clinicalReport')}</Typography>
                                                        <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2 }}>{e.type === 'report' ? t('timeline.clinicalReport') : t('timeline.conditionLogged')}</Typography>
                                                        {e.type === 'report' && <Button size="small" variant="outlined" sx={{ borderRadius: '10px' }}>{t('timeline.viewReport')}</Button>}
                                                        {e.type === 'diagnosis' && (
                                                            <Stack direction="row" spacing={1}>
                                                                <Chip label={e.severity} size="small" sx={{ bgcolor: `${getSeverityColor(e.severity)}20`, color: getSeverityColor(e.severity), fontWeight: 900 }} />
                                                                <Chip label={e.status} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                                                            </Stack>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            </motion.div>
                        </Grid>
                    )}
                </AnimatePresence>
            </Grid>

            {/* Health Story Micro-Insight */}
            <Paper className="glass-card" sx={{ mt: 4, p: 4, background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.05))' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ p: 2, borderRadius: '20px', bgcolor: 'rgba(99, 102, 241, 0.1)' }}><MonitorHeart sx={{ color: 'var(--primary)' }} /></Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>{t('timeline.healthStory')}</Typography>
                        <Typography variant="body1" color="var(--text-secondary)">
                            Your analysis trends show a <Typography component="span" fontWeight={900} color="var(--success)">12% {t('timeline.improvement')}</Typography> in clinical adherence since your first upload in {events.length > 0 ? events[events.length - 1].date.toLocaleString(t('language_code') || 'default', { month: 'long' }) : 'this month'}.
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default Timeline;
