import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Chip, Skeleton, Stack
} from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { TrendingUp, WaterDrop, FitnessCenter, CheckCircle, Scale } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../services/api';

const AnalyticsSection = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/health');
                setData(res.data);
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const latest = data[data.length - 1] || {};

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                {/* 1. Health Score Trend (Area Chart) */}
                <Grid item xs={12} md={7}>
                    <Paper className="glass-card" sx={{ p: 3, height: '100%', borderRadius: '20px' }}>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp sx={{ color: 'var(--primary)', fontSize: 18 }} /> Recovery & Mood Synergy
                        </Typography>
                        {loading ? (
                            <Skeleton variant="rectangular" height={180} />
                        ) : (
                            <ResponsiveContainer width="100%" height={180}>
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                        itemStyle={{ color: 'white', fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Recovery" />
                                    <Area type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>

                {/* 2. Metrics Summary */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                        <MetricSummaryCard label="Hydration" value={`${latest.water || 0}ml`} icon={<WaterDrop />} color="#0ea5e9" />
                        <MetricSummaryCard label="Activity" value={`${latest.steps || 0} steps`} icon={<FitnessCenter />} color="#f59e0b" />
                        <MetricSummaryCard label="Nutrition" value={`${latest.nutrition || 0}%`} icon={<CheckCircle />} color="#10b981" />
                    </Stack>
                </Grid>

                {/* 3. Goal Completion (Bar Chart) */}
                <Grid item xs={12}>
                    <Paper className="glass-card" sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2 }}>Daily Metric Breakdown</Typography>
                        {loading ? (
                            <Skeleton variant="rectangular" height={150} />
                        ) : (
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={data.slice(-7)}>
                                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="water" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Water" />
                                    <Bar dataKey="steps" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Steps" />
                                    <Bar dataKey="sleep" fill="#6366f1" radius={[4, 4, 0, 0]} name="Sleep" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

const MetricSummaryCard = ({ label, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, borderRadius: '10px', bgcolor: `${color}15`, color }}>{icon}</Box>
            <Typography variant="caption" fontWeight={900} color="var(--text-secondary)">{label.toUpperCase()}</Typography>
        </Stack>
        <Typography variant="body2" fontWeight={900}>{value}</Typography>
    </Paper>
);

export default AnalyticsSection;
