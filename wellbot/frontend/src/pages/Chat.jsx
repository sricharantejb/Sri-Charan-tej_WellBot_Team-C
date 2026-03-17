import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    IconButton,
    Avatar,
    CircularProgress,
    Divider,
    Button
} from '@mui/material';
import {
    Send,
    SmartToy,
    Person,
    MoreVert,
    Mic,
    Image as ImageIcon,
    TrackChanges
} from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';

const Chat = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Update welcome message when language changes
    useEffect(() => {
        setMessages([{ role: 'assistant', content: t('chatPage.welcomeMessage') }]);
    }, [t]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/chat`, { message: input }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const botMsg = {
                role: 'assistant',
                content: response.data.response,
                suggested_plan: response.data.suggested_plan
            };
            setMessages(prev => [...prev, botMsg]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: t('chatPage.errorMessage') }]);
        } finally {
            setLoading(false);
        }
    };

    const saveToPlan = async (plan) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/plan/save`, plan, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(prev => [...prev, { role: 'assistant', content: t('chatPage.successPlanAdded') }]);
        } catch (error) {
            console.error("Plan save error", error);
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', maxWidth: 1000, mx: 'auto' }}>
            <Paper className="glass-card" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
                {/* Chat Header */}
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', bgcolor: 'var(--surface)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'var(--primary)', width: 48, height: 48, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                            <SmartToy />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{t('chatPage.title')}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('chatPage.subtitle')}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <IconButton sx={{ color: 'var(--text-secondary)' }}><MoreVert /></IconButton>
                </Box>

                {/* Messages Area */}
                <Box
                    ref={scrollRef}
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        background: 'var(--background)'
                    }}
                >
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                            >
                                <Box sx={{ display: 'flex', gap: 1.5, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                    <Avatar sx={{
                                        width: 36, height: 36,
                                        bgcolor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                        color: msg.role === 'user' ? 'white' : 'var(--primary)',
                                        fontSize: '0.8rem',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        {msg.role === 'user' ? <Person sx={{ fontSize: 20 }} /> : <SmartToy sx={{ fontSize: 20 }} />}
                                    </Avatar>
                                    <Paper sx={{
                                        p: 2.5,
                                        borderRadius: msg.role === 'user' ? '24px 4px 24px 24px' : '4px 24px 24px 24px',
                                        bgcolor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                        boxShadow: 'var(--shadow-md)',
                                        border: '1px solid var(--glass-border)',
                                        position: 'relative'
                                    }}>
                                        <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: 500 }}>{msg.content}</Typography>

                                        {msg.suggested_plan && (
                                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--glass-border)' }}>
                                                <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 900, color: 'var(--primary)', letterSpacing: 1 }}>
                                                    {t('chatPage.protocolGenerated')}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<TrackChanges />}
                                                    onClick={() => saveToPlan(msg.suggested_plan)}
                                                    sx={{
                                                        bgcolor: 'var(--primary)',
                                                        color: 'white',
                                                        borderRadius: 'var(--radius-md)',
                                                        fontWeight: 800,
                                                        fontSize: '0.75rem',
                                                        textTransform: 'none',
                                                        px: 2,
                                                        '&:hover': { bgcolor: 'var(--primary-hover)' }
                                                    }}
                                                >
                                                    {t('chatPage.addToPlan')}
                                                </Button>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <Box sx={{ alignSelf: 'flex-start', ml: 6 }}>
                            <Box sx={{ px: 2, py: 1, borderRadius: 'var(--radius-md)', bgcolor: 'var(--surface)', border: '1px solid var(--glass-border)', display: 'flex', gap: 0.5 }}>
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--primary)' }}>•</motion.div>
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ color: 'var(--primary)' }}>•</motion.div>
                                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ color: 'var(--primary)' }}>•</motion.div>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Chat Input */}
                <Box sx={{ p: 3, borderTop: '1px solid var(--glass-border)', bgcolor: 'var(--surface)' }}>
                    <Paper
                        component="form"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 'var(--radius-lg)',
                            bgcolor: 'var(--background)',
                            border: '1px solid var(--glass-border)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <IconButton sx={{ color: 'var(--text-secondary)', transition: 'color 0.2s', '&:hover': { color: 'var(--primary)' } }}><Mic /></IconButton>
                        <IconButton sx={{ color: 'var(--text-secondary)', transition: 'color 0.2s', '&:hover': { color: 'var(--primary)' } }}><ImageIcon /></IconButton>
                        <Divider sx={{ height: 28, mx: 1, borderColor: 'var(--glass-border)' }} orientation="vertical" />
                        <TextField
                            fullWidth
                            placeholder={t('chatPage.placeholder')}
                            variant="standard"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            InputProps={{
                                disableUnderline: true,
                                sx: { fontWeight: 500, color: 'var(--text-primary)' }
                            }}
                            sx={{ px: 2 }}
                        />
                        <IconButton
                            color="primary"
                            type="submit"
                            disabled={!input.trim() || loading}
                            sx={{
                                bgcolor: 'var(--primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                width: 44, height: 44,
                                '&:hover': { bgcolor: 'var(--primary-hover)', transform: 'translateY(-2px)' },
                                '&.Mui-disabled': { bgcolor: 'var(--glass-border)', color: 'var(--text-secondary)', opacity: 0.5 },
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            <Send sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
};

export default Chat;
