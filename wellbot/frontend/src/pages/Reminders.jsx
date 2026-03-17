import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Fab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Chip,
    Switch,
    Button
} from '@mui/material';
import {
    NotificationsActive,
    Add,
    Medication,
    WaterDrop,
    FitnessCenter,
    Delete,
    AccessTime,
    Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
    MenuItem
} from '@mui/material';

const Reminders = () => {
    const { t } = useTranslation();
    const [reminders, setReminders] = useState([
        { id: 1, text: "Take Multivitamin", time: "09:00 AM", type: "medication", active: true },
        { id: 2, text: "Drink Water (500ml)", time: "11:00 AM", type: "water", active: true },
        { id: 3, text: "Evening Walk", time: "06:30 PM", type: "fitness", active: false },
        { id: 4, text: "Sleep Meditation", time: "10:00 PM", type: "health", active: true },
    ]);
    const [open, setOpen] = useState(false);
    const [newReminder, setNewReminder] = useState({ text: '', time: '08:00', type: 'health' });

    const getIcon = (type) => {
        switch (type) {
            case 'medication': return <Medication sx={{ color: '#ef4444' }} />;
            case 'water': return <WaterDrop sx={{ color: '#0ea5e9' }} />;
            case 'fitness': return <FitnessCenter sx={{ color: '#6366f1' }} />;
            default: return <NotificationsActive sx={{ color: '#8b5cf6' }} />;
        }
    };

    const toggleReminder = (id) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const deleteReminder = (id) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const handleAdd = () => {
        if (!newReminder.text) return;
        const id = reminders.length + 1;
        // Format time to AM/PM for display
        const [h, m] = newReminder.time.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayTime = `${h % 12 || 12}:${m} ${ampm}`;

        setReminders([...reminders, { ...newReminder, id, time: displayTime, active: true }]);
        setOpen(false);
        setNewReminder({ text: '', time: '08:00', type: 'health' });
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', pb: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{t('reminders.title')}</Typography>
                    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('reminders.subtitle')}</Typography>
                </Box>
                <Chip icon={<NotificationsActive sx={{ color: 'white !important' }} />} label={`${reminders.filter(r => r.active).length} ${t('reminders.active')}`} sx={{ fontWeight: 800, bgcolor: 'var(--primary)', color: 'white', px: 1 }} />
            </Box>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatePresence>
                    {reminders.map((reminder) => (
                        <motion.div
                            key={reminder.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            layout
                        >
                            <Paper
                                className="glass-card"
                                sx={{
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    opacity: reminder.active ? 1 : 0.6,
                                    borderLeft: `6px solid ${reminder.active ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    '&:hover': { transform: 'translateX(4px)', bgcolor: 'var(--surface-hover)' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 'var(--radius-md)', bgcolor: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                                        {getIcon(reminder.type)}
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)' }}>{reminder.text}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            <AccessTime sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{reminder.time}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Switch
                                        checked={reminder.active}
                                        onChange={() => toggleReminder(reminder.id)}
                                        color="primary"
                                    />
                                    <IconButton onClick={() => deleteReminder(reminder.id)} sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--secondary)', bgcolor: 'rgba(236, 72, 153, 0.1)' } }}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </List>

            <Fab
                color="primary"
                aria-label="add"
                onClick={() => setOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 40,
                    right: 40,
                    zIndex: 10,
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                    width: 64, height: 64,
                    '&:hover': { transform: 'scale(1.1) rotate(90deg)', background: 'linear-gradient(135deg, var(--primary-hover), var(--accent))' },
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                <Add sx={{ fontSize: 32 }} />
            </Fab>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: 'var(--background)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        width: '100%',
                        maxWidth: 400,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 1 }}>{t('reminders.addNewReminder')}</DialogTitle>
                <DialogContent>
                    <MuiTextField
                        fullWidth
                        label={t('reminders.reminderText')}
                        margin="normal"
                        value={newReminder.text}
                        onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                        variant="outlined"
                        sx={dialogTextFieldStyle}
                    />
                    <MuiTextField
                        fullWidth
                        type="time"
                        label={t('reminders.time')}
                        margin="normal"
                        value={newReminder.time}
                        onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                        variant="outlined"
                        sx={dialogTextFieldStyle}
                    />
                    <MuiTextField
                        select
                        fullWidth
                        label={t('reminders.type')}
                        margin="normal"
                        value={newReminder.type}
                        onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value })}
                        variant="outlined"
                        sx={dialogTextFieldStyle}
                    >
                        <MenuItem value="medication">{t('reminders.medication')}</MenuItem>
                        <MenuItem value="water">{t('reminders.water')}</MenuItem>
                        <MenuItem value="fitness">{t('reminders.fitness')}</MenuItem>
                        <MenuItem value="health">{t('reminders.health')}</MenuItem>
                    </MuiTextField>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={() => setOpen(false)} sx={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'none' }}>{t('reminders.cancel')}</Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        sx={{
                            borderRadius: 'var(--radius-md)',
                            px: 4,
                            background: 'linear-gradient(to right, var(--primary), var(--accent))',
                            fontWeight: 800,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        {t('reminders.addReminder')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const dialogTextFieldStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--surface)',
        '& fieldset': { borderColor: 'var(--glass-border)' },
        '&:hover fieldset': { borderColor: 'var(--primary)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-secondary)',
        fontWeight: 600,
        '&.Mui-focused': { color: 'var(--primary)' },
    },
};

export default Reminders;
