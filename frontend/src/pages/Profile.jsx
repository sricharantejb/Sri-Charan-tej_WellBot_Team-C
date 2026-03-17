import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Avatar,
    Divider,
    IconButton,
    MenuItem,
    Alert,
    Snackbar,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Person,
    Email,
    Height,
    MonitorWeight,
    Bloodtype,
    CalendarMonth,
    Wc,
    LocalPhone,
    MedicalInformation,
    Save,
    CameraAlt,
    EmojiEvents,
    RestaurantMenu,
    Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // eslint-disable-line
import api, { fetchProfile, updateProfile } from '../services/api';

const Profile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        blood_group: '',
        weight: '',
        height: '',
        age: '',
        gender: '',
        medical_conditions: '',
        health_goals: '',
        lifestyle_preferences: '',
        emergency_contact: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const loadProfile = useCallback(async () => {
        try {
            const response = await fetchProfile();
            setProfile(response.data);
        } catch {
            setSnackbar({ open: true, message: t('profile.loadFailed'), severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [t]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(profile);
            setSnackbar({ open: true, message: t('profile.updateSuccess'), severity: 'success' });
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.name = profile.name;
            localStorage.setItem('user', JSON.stringify(user));
        } catch {
            setSnackbar({ open: true, message: t('profile.saveFailed'), severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-lg)' }}>
                    <form onSubmit={handleSave}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h4" fontWeight={900} sx={{ mb: 4, letterSpacing: '-1.5px', color: 'var(--text-primary)' }}>{t('profile.title')}</Typography>
                                <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                    <Close />
                                </IconButton>
                            </Grid>

                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label={t('profile.fullName')} name="name" value={profile.name} onChange={handleChange} variant="outlined" />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label={t('profile.age')} name="age" type="number" value={profile.age || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label={t('profile.weight')} name="weight" type="number" value={profile.weight || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label={t('profile.height')} name="height" type="number" value={profile.height || ''} onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth select label={t('profile.gender')} name="gender" value={profile.gender || ''} onChange={handleChange}>
                                    <MenuItem value="Male">{t('profile.male')}</MenuItem>
                                    <MenuItem value="Female">{t('profile.female')}</MenuItem>
                                    <MenuItem value="Other">{t('profile.other')}</MenuItem>
                                </TextField>
                            </Grid>

                            {profile.bmi_value && (
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                                        border: '1px solid var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Box sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '10px',
                                            bgcolor: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            <Typography variant="h6" fontWeight={900}>{profile.bmi_value}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: 1 }}>{t('profile.currentBmi')}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body1" fontWeight={900} sx={{ color: 'var(--text-primary)' }}>{profile.bmi_category}</Typography>
                                                <Box sx={{
                                                    px: 1,
                                                    py: 0.2,
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: 900,
                                                    bgcolor: profile.bmi_category === 'Normal' ? '#22c55e' : '#f59e0b',
                                                    color: 'white'
                                                }}>
                                                    {profile.bmi_category === 'Normal' ? t('profile.ideal') : t('profile.monitor')}
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                            {/* Advanced Health Data */}
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)' }}>
                                    <EmojiEvents sx={{ color: 'var(--primary)' }} /> {t('profile.lifestyleGoals')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label={t('profile.healthGoals')} name="health_goals" value={profile.health_goals || ''} onChange={handleChange} placeholder="e.g. Weight loss, Improved sleep, Strength training" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={2} label={t('profile.lifestylePrefs')} name="lifestyle_preferences" value={profile.lifestyle_preferences || ''} onChange={handleChange} placeholder="e.g. Vegetarian diet, Sedentary office job, Afternoon workouts" />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={2} label={t('profile.medicalConditions')} name="medical_conditions" value={profile.medical_conditions || ''} onChange={handleChange} placeholder="e.g. Hypertension, No known allergies" />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={<Save />} sx={{ px: 6, py: 1.5, borderRadius: '12px', fontWeight: 800 }}>
                                    {saving ? t('profile.saving') : t('profile.saveProfile')}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    <Divider sx={{ my: 4, borderColor: 'var(--glass-border)' }} />
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: 'var(--text-primary)' }}>{t('profile.helpImprove')}</Typography>
                    <Stack spacing={2}>
                        <TextField fullWidth multiline rows={2} label={t('profile.yourFeedback')} placeholder={t('profile.feedbackPlaceholder')} id="feedback-input" />
                        <Button variant="outlined" onClick={async () => {
                            const msg = document.getElementById('feedback-input').value;
                            if (!msg) return;
                            try {
                                await api.post('/feedback', { message: msg, rating: 5 });
                                setSnackbar({ open: true, message: t('profile.feedbackSuccess'), severity: 'success' });
                                document.getElementById('feedback-input').value = '';
                            } catch {
                                setSnackbar({ open: true, message: t('profile.feedbackFailed'), severity: 'error' });
                            }
                        }} sx={{ borderRadius: '10px', fontWeight: 800, alignSelf: 'flex-start' }}>
                            {t('profile.sendFeedback')}
                        </Button>
                    </Stack>
                </Paper>
            </motion.div>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;
