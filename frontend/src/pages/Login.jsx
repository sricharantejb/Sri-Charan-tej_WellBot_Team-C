import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    IconButton,
    InputAdornment,
    Divider,
    ButtonGroup
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    Person,
    HealthAndSafety,
    Translate
} from '@mui/icons-material';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line
import { useTranslation } from 'react-i18next';
import VirtualKeyboard from '../components/VirtualKeyboard';

// API service handles the base URL

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'te', label: 'తె' },
];

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [activeField, setActiveField] = useState('name');
    const { t, i18n } = useTranslation();
    const isNativeScript = i18n.language === 'te' || i18n.language === 'hi';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVirtualChar = (char) => {
        setFormData(prev => ({ ...prev, [activeField]: prev[activeField] + char }));
    };

    const handleVirtualBackspace = () => {
        setFormData(prev => ({
            ...prev,
            [activeField]: prev[activeField].slice(0, -1)
        }));
    };

    const validatePassword = (password) => {
        const minLength = 7;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (password.length < minLength) return t('login.passwordLength');
        if (!hasUpperCase) return t('login.passwordUpper');
        if (!hasSpecialChar) return t('login.passwordSpecial');
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isLogin) {
            const passwordError = validatePassword(formData.password);
            if (passwordError) { setError(passwordError); return; }
        }
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/signup';
            const response = await api.post(endpoint, formData);
            const token = response.data.token || response.data.access_token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Hard redirect to ensure fresh app state with new credentials
                if (response.data.user.is_admin) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                setError(t('login.noToken'));
            }
        } catch (err) {
            setError(err.response?.data?.error || t('login.authFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await api.post('/auth/google', { token: credentialResponse.credential });
            const token = response.data.token || response.data.access_token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if (response.data.user.is_admin) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                setError(t('login.googleFailed'));
            }
        } catch {
            setError(t('login.googleFailed'));
        }
    };

    const handleLangChange = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('wellbot_lang', code);
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, position: 'relative', overflow: 'hidden' }}>
            {/* Background decorative elements */}
            <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)', zIndex: 0 }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: 450, zIndex: 1 }}
            >
                <Box className="glass-card" sx={{ p: { xs: 3, md: 5 }, width: '100%', position: 'relative', borderRadius: 'var(--radius-xl)' }}>

                    {/* Language Switcher - top right */}
                    <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Translate sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                        <ButtonGroup size="small">
                            {LANGUAGES.map(lang => (
                                <Button
                                    key={lang.code}
                                    onClick={() => handleLangChange(lang.code)}
                                    sx={{
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        minWidth: 32,
                                        py: 0.4,
                                        px: 0.8,
                                        border: '1px solid var(--glass-border) !important',
                                        bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'var(--surface)',
                                        color: i18n.language === lang.code ? 'white' : 'var(--text-secondary)',
                                        '&:hover': { bgcolor: i18n.language === lang.code ? 'var(--primary)' : 'rgba(255,255,255,0.08)' },
                                        transition: 'all 0.2s',
                                        borderRadius: 'var(--radius-sm) !important',
                                    }}
                                >
                                    {lang.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                            style={{ display: 'inline-block' }}
                        >
                            <Box sx={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}>
                                <HealthAndSafety sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                        </motion.div>
                        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                            {isLogin ? t('login.welcomeBack') : t('login.createAccount')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {isLogin ? t('login.subtitle_login') : t('login.subtitle_signup')}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    key="name-field"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TextField
                                        fullWidth
                                        label={t('login.fullName')}
                                        name="name"
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        onFocus={() => setActiveField('name')}
                                        InputProps={{
                                            startAdornment: (<InputAdornment position="start"><Person sx={{ color: 'var(--text-secondary)' }} /></InputAdornment>),
                                            endAdornment: isNativeScript ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setShowKeyboard(v => !v)}
                                                        title={i18n.language === 'te' ? 'తెలుగు కీబోర్డు' : 'हिन्दी कीबोर्ड'}
                                                        sx={{
                                                            color: showKeyboard ? 'var(--primary)' : 'var(--text-secondary)',
                                                            border: showKeyboard ? '1px solid var(--primary)' : '1px solid transparent',
                                                            borderRadius: '8px', fontSize: '13px', fontWeight: 800, px: 1,
                                                            '&:hover': { color: 'var(--primary)' }
                                                        }}
                                                    >
                                                        {i18n.language === 'te' ? 'అ' : 'अ'}
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : undefined
                                        }}
                                        sx={textFieldStyle}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <TextField
                            fullWidth
                            label={t('login.email')}
                            name="email"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: 'var(--text-secondary)' }} /></InputAdornment>) }}
                            sx={textFieldStyle}
                        />

                        <TextField
                            fullWidth
                            label={t('login.password')}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Lock sx={{ color: 'var(--text-secondary)' }} /></InputAdornment>),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'var(--text-secondary)' }}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={textFieldStyle}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3, mb: 2, height: 52, borderRadius: '12px', textTransform: 'none',
                                fontSize: '1rem', fontWeight: 600,
                                background: 'linear-gradient(to right, var(--primary), var(--accent))',
                                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                                '&:hover': { background: 'linear-gradient(to right, var(--primary-hover), var(--accent))', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.43)' },
                            }}
                        >
                            {loading ? t('login.processing') : (isLogin ? t('login.signIn') : t('login.createAccount'))}
                        </Button>
                    </form>

                    {/* Virtual Keyboard — shown when Telugu or Hindi is active */}
                    {isNativeScript && showKeyboard && (
                        <VirtualKeyboard
                            lang={i18n.language}
                            onChar={handleVirtualChar}
                            onBackspace={handleVirtualBackspace}
                            onClose={() => setShowKeyboard(false)}
                        />
                    )}

                    <Box sx={{ my: 3 }}>
                        <Divider sx={{ '&::before, &::after': { borderColor: 'var(--glass-border)' } }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', px: 1, fontWeight: 700 }}>
                                {t('login.orContinueWith')}
                            </Typography>
                        </Divider>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError(t('login.googleFailed'))}
                            theme="filled_black"
                            shape="pill"
                        />
                    </Box>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {isLogin ? t('login.noAccount') : t('login.haveAccount')}{' '}
                            <Button
                                onClick={() => setIsLogin(!isLogin)}
                                sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--primary)', '&:hover': { background: 'transparent', textDecoration: 'underline' } }}
                            >
                                {isLogin ? t('login.signUp') : t('login.signIn')}
                            </Button>
                        </Typography>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};

const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--surface)',
        '& fieldset': { borderColor: 'var(--glass-border)' },
        '&:hover fieldset': { borderColor: 'var(--primary)', opacity: 0.5 },
        '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
    },
    '& .MuiInputLabel-root': {
        color: 'var(--text-secondary)',
        fontWeight: 600,
        '&.Mui-focused': { color: 'var(--primary)' },
    },
};

export default Login;
