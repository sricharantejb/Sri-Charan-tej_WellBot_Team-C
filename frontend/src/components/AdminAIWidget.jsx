import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Stack,
    CircularProgress,
    Tooltip,
    Zoom,
    Chip
} from '@mui/material';
import {
    Terminal,
    Psychology,
    TrendingUp,
    Science,
    Send,
    Close,
    SmartToy,
    Code
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AnalyticAIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'bot', content: 'Analytic Intelligence Core initialized. I can synthesize user engagement metrics, clinical dispersion trends, or system performance logs. How can I help you optimize the platform today?' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message;
        setChat(prev => [...prev, { role: 'user', content: userMsg }]);
        setMessage('');
        setLoading(true);

        try {
            // Specialized admin chat route or handle logic locally for now
            const response = await api.post('/chat', {
                message: `[ADMIN CONTEXT: Oversight & Metrics] ${userMsg}`,
                context: 'admin_oversight'
            });
            setChat(prev => [...prev, { role: 'bot', content: response.data.response }]);
        } catch {
            setChat(prev => [...prev, { role: 'bot', content: 'Failed to access intelligence core. Check system logs.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 2000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        style={{ marginBottom: 20 }}
                    >
                        <Paper
                            className="glass-card"
                            sx={{
                                width: 400,
                                height: 550,
                                borderRadius: 'var(--radius-xl)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                border: '1px solid var(--primary)',
                                boxShadow: 'var(--shadow-xl)',
                                background: 'var(--background)'
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ p: 2.5, background: 'linear-gradient(90deg, #10b981, var(--primary))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: '12px' }}>
                                        <TrendingUp sx={{ fontSize: 20, color: 'white' }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={950} color="white" sx={{ letterSpacing: 0.5 }}>ANALYTIC ENGINE</Typography>
                                        <Typography variant="caption" color="rgba(255,255,255,0.8)" sx={{ display: 'block', lineHeight: 1, fontWeight: 800 }}>Data Oversight v2.0</Typography>
                                    </Box>
                                </Stack>
                                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
                            </Box>

                            {/* Chat Area */}
                            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {chat.map((msg, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '85%',
                                            p: 2,
                                            borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            bgcolor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface)',
                                            border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                                            boxShadow: msg.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: msg.role === 'user' ? 'white' : 'var(--text-primary)', fontWeight: msg.role === 'bot' ? 600 : 700 }}>
                                            {msg.content}
                                        </Typography>
                                    </Box>
                                ))}
                                {loading && <CircularProgress size={20} sx={{ ml: 2, mt: 1, color: 'var(--primary)' }} />}
                            </Box>

                            {/* Quick Actions */}
                            <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label="Metrics Summary"
                                    size="small"
                                    onClick={() => setMessage('Provide a high-level summary of active users and chat volume.')}
                                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'var(--text-primary)', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 800, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' } }}
                                />
                                <Chip
                                    label="Clinical Trends"
                                    size="small"
                                    onClick={() => setMessage('What are the most common conditions being analyzed currently?')}
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--text-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 800, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' } }}
                                />
                                <Chip
                                    label="Anomalies"
                                    size="small"
                                    onClick={() => setMessage('Are there any suspicious usage patterns or system errors today?')}
                                    sx={{ bgcolor: 'rgba(236, 72, 153, 0.1)', color: 'var(--text-primary)', border: '1px solid rgba(236, 72, 153, 0.2)', fontWeight: 800, '&:hover': { bgcolor: 'rgba(236, 72, 153, 0.2)' } }}
                                />
                            </Box>

                            {/* Input Area */}
                            <Box sx={{ p: 2, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 1, bgcolor: 'var(--surface)' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Execute command or ask..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 'var(--radius-md)',
                                            bgcolor: 'var(--background)',
                                            color: 'var(--text-primary)',
                                            '& fieldset': { borderColor: 'var(--glass-border)' }
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={handleSend}
                                    sx={{
                                        bgcolor: 'var(--primary)',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'var(--accent)', transform: 'scale(1.05)' },
                                        transition: '0.2s'
                                    }}
                                >
                                    <Send sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>

            <Zoom in={true}>
                <Box
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        width: 'auto',
                        minWidth: 84,
                        px: 2,
                        height: 64,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(2deg)',
                            boxShadow: '0 12px 40px rgba(99, 102, 241, 0.6)'
                        }
                    }}
                >
                    <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 900, fontSize: '10px', mt: 0.5, letterSpacing: 0.5 }}>
                        AI ANALYTICS
                    </Typography>
                </Box>
            </Zoom>
        </Box>
    );
};

export default AnalyticAIAssistant;
