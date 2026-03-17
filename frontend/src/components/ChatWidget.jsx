import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Avatar,
    Fab,
    Tooltip,
    CircularProgress,
    Button,
    Stack,
    Chip
} from '@mui/material';
import {
    Close,
    Send,
    SmartToy,
    AttachFile,
    Psychology,
    Bolt,
    WarningAmber,
    AutoAwesome
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import api from '../services/api';



const ChatWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    // Fetch History when widget opens
    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, t]);

    const fetchHistory = async () => {
        try {
            const response = await api.get('/chat/history');
            const history = response.data;
            if (history && history.length > 0) {
                const formatted = [];
                history.forEach(h => {
                    formatted.push({ role: 'user', content: h.user });
                    formatted.push({ role: 'assistant', content: h.bot });
                });
                setMessages(formatted);
            } else {
                setMessages([{ role: 'assistant', content: t('chat.welcomeMessage') }]);
            }
        } catch (error) {
            console.error("History fetch error:", error);
            setMessages([{ role: 'assistant', content: t('chat.welcomeMessage') }]);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && !file) return;

        const userMsg = { role: 'user', content: input, hasFile: !!file };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            let response;
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('message', input || t('chat.analyzeReport'));

                response = await api.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setFile(null);
            } else {
                response = await api.post('/chat', { message: input });
            }

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) { setFile(e.target.files[0]); }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <Paper
                            elevation={12}
                            sx={{
                                width: { xs: 'calc(100vw - 64px)', sm: 420 },
                                height: 620,
                                mb: 3,
                                borderRadius: 'var(--radius-xl)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--background)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                                position: 'relative'
                            }}
                        >
                            {/* Header - Coach Identity */}
                            <Box sx={{
                                p: 3,
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 8 }}
                                    style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'white', filter: 'blur(80px)' }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', position: 'relative' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44, border: '1px solid rgba(255,255,255,0.3)' }}>
                                            <Psychology sx={{ fontSize: 24, color: 'white' }} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>{t('chat.title')}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', animation: 'pulse 1.5s infinite', boxShadow: '0 0 8px #22c55e' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.9 }}>{t('chat.liveSyncActive')}</Typography>
                                            </Stack>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' } }}>
                                        <Close sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Predictive Advice Banner */}
                            <Box sx={{ bgcolor: 'var(--surface)', px: 3, py: 1.5, borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AutoAwesome sx={{ fontSize: 14, color: 'var(--primary)' }} />
                                <Typography variant="caption" fontWeight={900} sx={{ color: 'var(--primary)', letterSpacing: 0.5 }}>{t('chat.coachAdvice').toUpperCase()}</Typography>
                            </Box>

                            {/* Chat Messages */}
                            <Box
                                ref={scrollRef}
                                sx={{
                                    flexGrow: 1,
                                    p: 3,
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                    background: 'var(--background)'
                                }}
                            >
                                {messages.map((msg, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '90%'
                                        }}
                                    >
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                            <Paper sx={{
                                                p: 2,
                                                borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '4px 24px 24px 24px',
                                                bgcolor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                                border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                                boxShadow: msg.role === 'user' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                                fontWeight: 500
                                            }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}>{msg.content}</Typography>
                                            </Paper>
                                        </motion.div>
                                    </Box>
                                ))}
                                {loading && (
                                    <Box sx={{ alignSelf: 'flex-start', p: 1 }}>
                                        <CircularProgress size={20} thickness={6} sx={{ color: 'var(--primary)' }} />
                                    </Box>
                                )}
                            </Box>

                            {/* Action Area */}
                            <Box sx={{ p: 3, borderTop: '1px solid var(--glass-border)', bgcolor: 'var(--surface)' }}>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                    <IconButton
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ bgcolor: 'var(--background)', p: 1.5, border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                                    >
                                        <AttachFile sx={{ fontSize: 20 }} />
                                    </IconButton>
                                    <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />

                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        placeholder={t('chat.placeholder')}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: { color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }
                                        }}
                                        sx={{ bgcolor: 'var(--background)', p: 1.5, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}
                                    />

                                    <IconButton
                                        onClick={handleSend}
                                        disabled={loading || (!input.trim() && !file)}
                                        sx={{
                                            bgcolor: 'var(--primary)',
                                            color: 'white',
                                            width: 48,
                                            height: 48,
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                            '&:hover': { bgcolor: 'var(--primary-hover)', transform: 'translateY(-2px)' },
                                            '&.Mui-disabled': { bgcolor: 'var(--glass-border)', color: 'var(--text-secondary)', opacity: 0.5 },
                                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}
                                    >
                                        <Send sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            <Fab
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    width: 72,
                    height: 72,
                    background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 50%, var(--accent) 100%)',
                    boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                        transform: 'scale(1.08) rotate(5deg)',
                        boxShadow: '0 16px 32px rgba(99, 102, 241, 0.6)',
                    },
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <Close sx={{ fontSize: 28, color: 'white' }} />
                        </motion.div>
                    ) : (
                        <motion.div key="coach" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                            <Stack alignItems="center">
                                <Psychology sx={{ fontSize: 32, color: 'white' }} />
                                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 900, color: 'white', mt: -0.5 }}>{t('chat.coach')}</Typography>
                            </Stack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Fab>
        </Box>
    );
};

export default ChatWidget;
