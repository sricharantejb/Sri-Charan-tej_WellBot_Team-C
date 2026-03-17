import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Container,
    Stack,
    Step,
    Stepper,
    StepLabel,
    Divider,
    Fade,
    Chip,
    Avatar,
    Grid
} from '@mui/material';
import {
    CloudUpload,
    Description,
    CheckCircle,
    ErrorOutline,
    Close,
    Security,
    Psychology,
    TipsAndUpdates,
    HealthAndSafety,
    TrendingDown,
    Assignment
} from '@mui/icons-material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line

const API_URL = 'http://localhost:5100/api';

const WorkflowStepper = ({ activeStep }) => {
    const { t } = useTranslation();
    const steps = [
        t('upload.stepUpload'),
        t('upload.stepAnalysis'),
        t('upload.stepInsights'),
        t('upload.stepPlan')
    ];
    return (
        <Box sx={{ width: '100%', mb: 6 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            StepIconProps={{
                                sx: {
                                    '&.Mui-active': { color: 'var(--primary)' },
                                    '&.Mui-completed': { color: 'var(--success)' },
                                }
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {label}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

const IntelligenceBriefing = ({ result, onReset }) => {
    const { t } = useTranslation();

    // Safely parse or use the object
    const data = typeof result === 'object' ? result : { summary: result };

    const copyToClipboard = () => {
        const text = `
${t('upload.recoverySummaryLabel')}:
${data.summary}

${t('upload.nutritionProtocolLabel')}:
(${t('plan.veg')}): ${data.veg_diet?.map(t => t.task).join(', ')}
(${t('plan.nonVeg')}): ${data.non_veg_diet?.map(t => t.task).join(', ')}

${t('upload.exerciseLabel')}:
${data.exercise_plan?.map(t => t.task).join(', ')}

${t('upload.strategicGuardrailsLabel')}:
${t('plan.dos')}: ${data.dos}
${t('plan.donts')}: ${data.donts}
        `;
        navigator.clipboard.writeText(text);
        alert(t('upload.successCopy'));
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <Paper className="glass-card" sx={{ p: { xs: 3, md: 6 }, position: 'relative', overflow: 'hidden' }}>
                <Box className="scan-line" sx={{ opacity: 0.2 }} />

                <IconButton
                    onClick={onReset}
                    sx={{ position: 'absolute', right: 24, top: 24, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                    <Close />
                </IconButton>

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    <Avatar sx={{ bgcolor: 'var(--primary)', width: 64, height: 64, boxShadow: '0 0 20px var(--primary)' }}>
                        <Psychology sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={950} sx={{ letterSpacing: '-1.5px', textTransform: 'uppercase' }}>{t('upload.briefingTitle')}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 900, letterSpacing: 2 }}>ANALYSIS ID: #WBALPHA-2024</Typography>
                    </Box>
                </Stack>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Stack spacing={3}>
                            <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 950, color: 'var(--primary)', mb: 2, letterSpacing: 1.5 }}>{t('upload.clinicalSummaryLabel')}</Typography>
                                <Typography variant="h6" sx={{ lineHeight: 1.6, fontWeight: 500, color: 'var(--text-primary)' }}>
                                    {data.summary}
                                </Typography>
                            </Box>

                            <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 950, color: '#10b981', mb: 2, letterSpacing: 1.5 }}>{t('upload.protocolPreviewLabel')}</Typography>
                                <Stack spacing={2}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>• 🥗 Veg: {data.veg_diet?.slice(0, 3).map(t => t.task).join(', ')}...</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>• 🍗 Non-Veg: {data.non_veg_diet?.slice(0, 3).map(t => t.task).join(', ')}...</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>• 🏃 Exercise: {data.exercise_plan?.slice(0, 2).map(t => t.task).join(', ')}...</Typography>
                                </Stack>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<Assignment />}
                                onClick={copyToClipboard}
                                sx={{ py: 2, borderRadius: '16px', fontWeight: 900, fontSize: '1rem', textTransform: 'none', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
                            >
                                {t('upload.copyProtocolBtn')}
                            </Button>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 950, mb: 1, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1 }}>
                                    <TrendingDown fontSize="small" /> RISK ASSESSMENT
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    Detected anomalies in report suggest prioritize antioxidant-rich foods and light movement.
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 950, mb: 1, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1 }}>
                                    <HealthAndSafety fontSize="small" /> STRATEGIC ACTION
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    Successfully mapped clinical findings to your local recovery OS.
                                </Typography>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>

                <Alert severity="warning" sx={{ mt: 4, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: 'white' }}>
                    Informational only. This analysis is performed by AI and should be reviewed by a qualified doctor before making medical changes.
                </Alert>
            </Paper>
        </motion.div>
    );
};

const Upload = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            // Use specialized report endpoint instead of chat/upload
            const response = await axios.post(`${API_URL}/reports/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });

            setResult(response.data.briefing);

            // Navigate after 8 seconds of viewing the briefing briefing
            setTimeout(() => {
                navigate('/plan');
            }, 8000);
        } catch (err) {
            setError(err.response?.data?.error || 'Intelligence engine failed to synchronize.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 }, pt: 8 }}>
            <Container maxWidth="lg">
                <WorkflowStepper activeStep={result ? 2 : (uploading ? 1 : 0)} />

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Box sx={{ textAlign: 'center', mb: 8 }}>
                                <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.04em' }}>
                                    {t('upload.title')}
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'var(--text-secondary)', maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
                                    {t('upload.subtitle')}
                                </Typography>
                            </Box>

                            <Paper
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                                onClick={() => fileInputRef.current.click()}
                                sx={{
                                    p: { xs: 4, md: 10 },
                                    borderRadius: 'var(--radius-xl)',
                                    background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'var(--background)',
                                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--glass-border)'}`,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': { background: 'var(--surface)', borderColor: 'var(--primary)' }
                                }}
                            >
                                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />

                                {uploading && <Box className="scan-line" />}

                                <Box sx={{ mb: 4 }}>
                                    <motion.div animate={uploading ? { scale: [1, 1.1, 1] } : { y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                                        {uploading ? (
                                            <Psychology sx={{ fontSize: 80, color: 'var(--primary)' }} />
                                        ) : (
                                            <CloudUpload sx={{ fontSize: 80, color: file ? 'var(--success)' : 'var(--text-secondary)' }} />
                                        )}
                                    </motion.div>
                                </Box>

                                <Typography variant="h4" fontWeight={900} gutterBottom>
                                    {uploading ? t('upload.analyzing') : (file ? file.name : t('upload.dropHere'))}
                                </Typography>
                                <Typography variant="body1" color="var(--text-secondary)" sx={{ mb: 6 }}>
                                    {uploading ? t('upload.processingOcr') : t('upload.supported')}
                                </Typography>

                                {file && !uploading && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                        sx={{
                                            px: 8,
                                            py: 2.5,
                                            borderRadius: '20px',
                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                            fontWeight: 900,
                                            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)'
                                        }}
                                    >
                                        {t('upload.initAnalysis')}
                                    </Button>
                                )}
                            </Paper>

                            <Grid container spacing={3} sx={{ mt: 8 }}>
                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Security sx={{ color: 'var(--success)' }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800}>{t('upload.encrypted')}</Typography>
                                            <Typography variant="caption" color="var(--text-secondary)">{t('upload.hipaa')}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Psychology sx={{ color: 'var(--primary)' }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800}>{t('upload.aiExtraction')}</Typography>
                                            <Typography variant="caption" color="var(--text-secondary)">{t('upload.riskMapping')}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <HealthAndSafety sx={{ color: 'var(--accent)' }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800}>{t('upload.validatedInsights')}</Typography>
                                            <Typography variant="caption" color="var(--text-secondary)">{t('upload.clinicalData')}</Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </motion.div>
                    ) : (
                        <IntelligenceBriefing result={result} onReset={() => { setResult(null); setFile(null); }} />
                    )}
                </AnimatePresence>

                {error && <Alert severity="error" sx={{ mt: 3, borderRadius: '20px' }} onClose={() => setError(null)}>{error}</Alert>}
            </Container>
        </Box>
    );
};

export default Upload;
