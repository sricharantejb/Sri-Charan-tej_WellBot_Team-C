import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Stack,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    Avatar,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    HealthAndSafety,
    Description,
    Chat as ChatIcon,
    History as HistoryIcon,
    Timeline as TimelineIcon,
    Event,
    Verified,
    Star
} from '@mui/icons-material';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line
import { useTranslation } from 'react-i18next';

const History = () => {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);
    const [reports, setReports] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [reportsRes, diagRes, chatRes, timelineRes] = await Promise.all([
                api.get('/reports'),
                api.get('/diagnoses'),
                api.get('/chat/history'),
                api.get('/health-timeline')
            ]);
            setReports(reportsRes.data);
            setDiagnoses(diagRes.data);
            setChatHistory(chatRes.data);
            setTimeline(timelineRes.data);
        } catch (error) {
            console.error("History fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 6 }}>
                <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-3px', mb: 1, color: 'var(--text-primary)' }}>
                    {t('history.title').split(' ')[0]} <span style={{ color: 'var(--primary)' }}>{t('history.title').split(' ').slice(1).join(' ')}</span>
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {t('history.subtitle')}
                </Typography>
            </Box>

            <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                sx={{
                    mb: 4,
                    '& .MuiTab-root': { fontWeight: 900, color: 'var(--text-secondary)', minHeight: 64, fontSize: '1rem' },
                    '& .Mui-selected': { color: 'var(--primary) !important' },
                    '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0', background: 'linear-gradient(90deg, var(--primary), var(--accent))' },
                    borderBottom: '1px solid var(--glass-border)'
                }}
            >
                <Tab icon={<TimelineIcon />} label={t('history.tabJourney')} iconPosition="start" />
                <Tab icon={<HealthAndSafety />} label={t('history.tabLedger')} iconPosition="start" />
                <Tab icon={<ChatIcon />} label={t('history.tabIntel')} iconPosition="start" />
            </Tabs>

            <AnimatePresence mode="wait">
                {/* 1. JOURNEY TIMELINE */}
                {tab === 0 && (
                    <motion.div key="journey" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <Paper className="glass-card" sx={{ p: { xs: 3, md: 6 }, borderRadius: 'var(--radius-xl)' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Box sx={{
                                    position: 'absolute',
                                    left: { xs: 20, md: 40 }, top: 0, bottom: 0,
                                    width: 4,
                                    bgcolor: 'var(--primary)',
                                    opacity: 0.1,
                                    borderRadius: 2
                                }} />

                                <Stack spacing={6}>
                                    {timeline.map((event) => (
                                        <Box key={event.id} sx={{ position: 'relative', pl: { xs: 7, md: 12 } }}>
                                            <Avatar sx={{
                                                position: 'absolute',
                                                left: { xs: 0, md: 20 }, top: 0,
                                                bgcolor: event.type === 'joined' ? 'var(--primary)' : 'var(--success)',
                                                boxShadow: `0 0 20px ${event.type === 'joined' ? 'var(--primary)' : 'var(--success)'}40`,
                                                zIndex: 2,
                                                width: 44,
                                                height: 44
                                            }}>
                                                {event.type === 'joined' ? <Star /> : <Verified />}
                                            </Avatar>

                                            <Box>
                                                <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: 1.5 }}>
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                </Typography>
                                                <Typography variant="h5" fontWeight={950} sx={{ mt: 0.5, mb: 1, color: 'var(--text-primary)' }}>{event.title}</Typography>
                                                <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600, maxWidth: 600 }}>
                                                    {event.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                    {timeline.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                                            <HistoryIcon sx={{ fontSize: 60, mb: 2 }} />
                                            <Typography variant="h6" fontWeight={800}>{t('history.noJourney')}</Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Paper>
                    </motion.div>
                )}

                {/* 2. MEDICAL LEDGER */}
                {tab === 1 && (
                    <motion.div key="ledger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <Paper className="glass-card" sx={{ p: 0, overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
                                    <TableContainer>
                                        <Table>
                                            <TableHead sx={{ bgcolor: 'var(--surface)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 900, py: 3 }}>{t('history.condition')}</TableCell>
                                                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 900 }}>{t('history.date')}</TableCell>
                                                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 900 }}>{t('history.severity')}</TableCell>
                                                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 900 }}>{t('history.source')}</TableCell>
                                                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 900 }}>{t('history.status')}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {diagnoses.length > 0 ? diagnoses.map((diag) => (
                                                    <TableRow key={diag.id} sx={{ '&:hover': { bgcolor: 'var(--surface)' } }}>
                                                        <TableCell sx={{ color: 'var(--text-primary)', fontWeight: 900 }}>
                                                            {diag.name}
                                                            {diag.source === 'AI Analysis' && (
                                                                <Chip label="NEW" size="small" sx={{ ml: 1, height: 16, fontSize: '0.6rem', bgcolor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', fontWeight: 950 }} />
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{new Date(diag.diagnosed_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={diag.severity?.toUpperCase() || 'MODERATE'}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 900,
                                                                    bgcolor: diag.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                                    color: diag.severity === 'Critical' ? '#ef4444' : '#f59e0b'
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 800, color: diag.source === 'AI Analysis' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                                            {diag.source || 'Clinical'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={diag.status || 'Active'} size="small" variant="outlined" sx={{ fontWeight: 900, color: 'var(--primary)', borderColor: 'var(--primary)' }} />
                                                        </TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                                            <Typography variant="body1" fontWeight={700} color="var(--text-secondary)">{t('history.noDiagnoses')}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h5" sx={{ fontWeight: 950, mb: 4, letterSpacing: '-1px', color: 'var(--text-primary)' }}>{t('history.labReports')}</Typography>
                                <Grid container spacing={3}>
                                    {reports.map(r => (
                                        <Grid item xs={12} md={4} key={r.id}>
                                            <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-lg)', borderTop: '4px solid var(--primary)' }}>
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                                    <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                                                        <Description />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={900} sx={{ color: 'var(--text-primary)' }}>SCAN #{r.id}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>
                                                            {new Date(r.upload_time).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Typography variant="body2" sx={{
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: 1.6,
                                                    fontWeight: 600,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {r.summary}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        </Grid>
                    </motion.div>
                )}

                {/* 3. CHAT ARCHIVE */}
                {tab === 2 && (
                    <motion.div key="chat" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        <Paper className="glass-card" sx={{ p: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                            <Box sx={{ bgcolor: 'var(--surface)', p: 4, borderBottom: '1px solid var(--glass-border)' }}>
                                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--text-primary)' }}>{t('history.conversationRepo')}</Typography>
                                <Typography variant="body2" color="var(--text-secondary)" sx={{ fontWeight: 600 }}>{t('history.pastInteractions')}</Typography>
                            </Box>
                            <Box sx={{ p: 4, maxHeight: '60vh', overflowY: 'auto' }}>
                                <Stack spacing={4}>
                                    {chatHistory.length > 0 ? chatHistory.map((chat, i) => (
                                        <Box key={i} sx={{ position: 'relative', pl: 4, borderLeft: '2px solid var(--primary)', opacity: 0.8 }}>
                                            <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 900, display: 'block', mb: 2 }}>
                                                {new Date(chat.timestamp).toLocaleString().toUpperCase()}
                                            </Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'var(--text-primary)', mb: 0.5 }}>YOU</Typography>
                                                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{chat.user_message || chat.user}</Typography>
                                                </Box>
                                                <Box sx={{ bgcolor: 'var(--surface)', p: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'var(--primary)', mb: 0.5 }}>WELLBOT AI</Typography>
                                                    <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>{chat.bot_response || chat.bot}</Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    )) : (
                                        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.3 }}>
                                            <ChatIcon sx={{ fontSize: 60, mb: 2 }} />
                                            <Typography variant="body1" fontWeight={900} color="var(--text-secondary)">{t('history.noConversations')}</Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default History;
