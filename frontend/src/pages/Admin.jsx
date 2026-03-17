import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    Avatar,
    Stack,
    Rating,
    IconButton,
    Button,
    Tabs,
    Tab,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material';
import {
    Group,
    Chat,
    Assignment,
    Description,
    AutoGraph,
    Settings as SettingsIcon,
    CloudDone,
    Terminal,
    Security,
    Science,
    Timeline,
    Visibility,
    Block,
    Delete,
    CheckCircle
} from '@mui/icons-material';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    Filler,
    ArcElement
);

const Admin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [insights, setInsights] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [settings, setSettings] = useState({});

    const pathMap = {
        '/admin': 0,
        '/admin/users': 1,
        '/admin/analytics': 2,
        '/admin/chat-monitoring': 3,
        '/admin/feedback': 4,
        '/admin/logs': 5,
        '/admin/settings': 6,
    };

    const currentTab = pathMap[location.pathname] || 0;

    const handleTabChange = (event, newValue) => {
        const reverseMap = Object.keys(pathMap).find(key => pathMap[key] === newValue);
        if (reverseMap) navigate(reverseMap);
    };

    const loadAllAdminData = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (!user || (!user.is_admin && !user.is_Admin)) {
                window.location.href = '/dashboard';
                return;
            }

            const [statsRes, usersRes, chatsRes, feedbackRes, logsRes, insightsRes, settingsRes, heatmapRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/chats'),
                api.get('/admin/feedbacks'),
                api.get('/admin/logs'),
                api.get('/admin/health-insights'),
                api.get('/admin/settings'),
                api.get('/admin/analytics/activity-heatmap')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setChats(chatsRes.data);
            setFeedbacks(feedbackRes.data);
            setLogs(logsRes.data);
            setInsights(insightsRes.data);
            setSettings(settingsRes.data);
            setHeatmapData(heatmapRes.data);
        } catch (err) {
            console.error("Admin data load error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllAdminData();
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress thickness={6} size={60} sx={{ color: 'var(--primary)' }} />
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: { xs: 2, md: 4 }, position: 'relative' }}>
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-3px', color: 'var(--text-primary)', mb: 1 }}>
                        ADMIN OVERSIGHT
                    </Typography>
                    <Typography variant="h6" color="var(--text-secondary)" sx={{ fontWeight: 700, opacity: 0.8 }}>
                        Command center for system monitoring and user intelligence
                    </Typography>
                </Box>
                <Paper className="glass-card" sx={{ px: 3, py: 1.5, display: 'flex', gap: 4, borderRadius: 'var(--radius-lg)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box className="pulse-primary" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <Typography variant="subtitle2" fontWeight={900} color="var(--text-primary)">GATEWAY: ACTIVE</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box className="pulse-primary" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                        <Typography variant="subtitle2" fontWeight={900} color="var(--text-primary)">INTEL: OPTIMIZED</Typography>
                    </Box>
                </Paper>
            </Box>

            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                    mb: 4,
                    '& .MuiTabs-indicator': { height: 4, borderRadius: 2, background: 'linear-gradient(90deg, var(--primary), var(--accent))' },
                    '& .MuiTab-root': { fontWeight: 900, color: 'var(--text-secondary)', fontSize: '0.95rem', py: 2, px: 3, transition: 'all 0.2s' },
                    '& .Mui-selected': { color: 'var(--primary) !important' },
                    borderBottom: '1px solid var(--glass-border)'
                }}
            >
                <Tab label="Oversight" />
                <Tab label="Users" />
                <Tab label="Analytics" />
                <Tab label="Intelligence" />
                <Tab label="Feedback" />
                <Tab label="Logs" />
                <Tab label="System" />
            </Tabs>

            <AnimatePresence mode="wait">
                <Box key={currentTab}>
                    {currentTab === 0 && <DashboardTab stats={stats} feedbacks={feedbacks} logs={logs} insights={insights} />}
                    {currentTab === 1 && <UserManagementTab users={users} />}
                    {currentTab === 2 && <AnalyticsTab heatmapData={heatmapData} insights={insights} />}
                    {currentTab === 3 && <ChatMonitoringTab chats={chats} />}
                    {currentTab === 4 && <FeedbackTab feedbacks={feedbacks} />}
                    {currentTab === 5 && <LogsTab logs={logs} />}
                    {currentTab === 6 && <SettingsTab initialSettings={settings} />}
                </Box>
            </AnimatePresence>
        </Box>
    );
};

const MetricCard = ({ title, value, icon, color }) => (
    <Paper className="glass-card" sx={{ p: 3, borderRadius: 'var(--radius-lg)', borderLeft: `6px solid ${color}` }}>
        <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48 }}>{icon}</Avatar>
            <Box>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 900, letterSpacing: 1.5 }}>{title.toUpperCase()}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, color: 'var(--text-primary)' }}>{value}</Typography>
            </Box>
        </Stack>
    </Paper>
);

const DashboardTab = ({ stats, insights }) => {
    const velocityData = {
        labels: stats?.trends?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'System Interactions',
                data: stats?.trends?.chats || [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                pointBackgroundColor: 'var(--primary)',
                tension: 0.45,
                fill: true,
                borderWidth: 4,
            },
            {
                label: 'New Registrations',
                data: stats?.trends?.registrations || [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderDash: [5, 5],
                tension: 0.45,
                borderWidth: 2,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: 'var(--text-secondary)', font: { weight: '800', size: 10 } } },
            tooltip: { backgroundColor: 'var(--surface)', titleColor: 'var(--primary)', bodyColor: 'var(--text-primary)', cornerRadius: 12, padding: 12 }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: 'var(--text-secondary)', font: { weight: '700' } } },
            x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)', font: { weight: '700' } } }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={2.4}><MetricCard title="Users" value={stats?.total_users || 0} icon={<Group />} color="var(--primary)" /></Grid>
                <Grid item xs={12} md={2.4}><MetricCard title="Active Today" value={stats?.active_today || 0} icon={<Timeline />} color="#10b981" /></Grid>
                <Grid item xs={12} md={2.4}><MetricCard title="Total Chats" value={stats?.total_chats || 0} icon={<Chat />} color="#f59e0b" /></Grid>
                <Grid item xs={12} md={2.4}><MetricCard title="Active Plans" value={stats?.total_plans || 0} icon={<Assignment />} color="#ec4899" /></Grid>
                <Grid item xs={12} md={2.4}><MetricCard title="Total Records" value={stats?.total_reports || 0} icon={<Description />} color="#8b5cf6" /></Grid>

                <Grid item xs={12} lg={8}>
                    <Paper className="glass-card" sx={{ p: 4, height: 480, borderRadius: 'var(--radius-xl)' }}>
                        <Typography variant="h6" fontWeight={900} mb={3} sx={{ letterSpacing: -0.5 }}>System Velocity Oversight</Typography>
                        <Box sx={{ height: 380 }}><Line data={velocityData} options={chartOptions} /></Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper className="glass-card" sx={{ p: 4, height: 480, borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
                        <Typography variant="h6" fontWeight={900} mb={4} display="flex" alignItems="center" gap={2}>
                            <AutoGraph sx={{ color: 'var(--primary)' }} /> Intelligence Feed
                        </Typography>
                        {insights?.conditions?.length > 0 ? (
                            <Stack spacing={4}>
                                {insights.conditions.slice(0, 4).map((c, i) => (
                                    <Box key={i}>
                                        <Stack direction="row" justifyContent="space-between" mb={1.5} alignItems="center">
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</Typography>
                                            <Chip label={`${((c.count / (insights.total_reports || 1)) * 100).toFixed(0)}%`} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} />
                                        </Stack>
                                        <Box sx={{ height: 8, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(c.count / (insights.total_reports || 1)) * 100}%` }}
                                                transition={{ duration: 1, delay: i * 0.2 }}
                                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 4 }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                                <Science sx={{ fontSize: 80, mb: 3, color: 'var(--primary)', opacity: 0.4 }} />
                                <Typography variant="h6" fontWeight={900} sx={{ color: 'var(--text-primary)' }}>Calibrating Sensors...</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 1 }}>Awaiting medical report streams for demographic profiling</Typography>
                            </Box>
                        )}
                        <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 4 }}>
                            <Button fullWidth variant="outlined" sx={{ borderRadius: '12px', borderColor: 'var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 800 }}>View Global Ledger</Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </motion.div>
    );
};

const UserManagementTab = ({ users }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper className="glass-card" sx={{ p: 0, overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, color: 'var(--text-secondary)', py: 3 }}>USER IDENTITY</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>ACCESS VECTOR</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>STATUS</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>ONBOARDED</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 900, color: 'var(--text-secondary)' }}>PROTOCOLS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                <TableCell sx={{ py: 2.5 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'var(--primary)', fontWeight: 900, boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' }}>{u.name[0]}</Avatar>
                                        <Box>
                                            <Typography fontWeight={900} sx={{ color: 'var(--text-primary)' }}>{u.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 700 }}>HEX: {u.id.toString(16).toUpperCase()}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{u.email}</TableCell>
                                <TableCell><Chip label="Active" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 900, borderRadius: '8px' }} /></TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <IconButton size="small" sx={{ color: 'var(--primary)' }}><Visibility /></IconButton>
                                        <IconButton size="small" sx={{ color: '#f59e0b' }}><Block /></IconButton>
                                        <IconButton size="small" sx={{ color: '#f43f5e' }}><Delete /></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </motion.div>
);

const ChatMonitoringTab = ({ chats }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper className="glass-card" sx={{ p: 0 }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900 }}>USER</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>MESSAGE</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>BOT RESPONSE</TableCell>
                            <TableCell sx={{ fontWeight: 900 }}>TIME</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chats.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell sx={{ width: 220 }}>
                                    <Typography fontWeight={800}>{c.user_name}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>{c.user_email}</Typography>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300 }}>{c.user_message}</TableCell>
                                <TableCell>{c.bot_response}</TableCell>
                                <TableCell sx={{ width: 120 }}>{new Date(c.timestamp).toLocaleTimeString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    </motion.div>
);

const AnalyticsTab = ({ heatmapData, insights }) => {
    const pieData = {
        labels: insights?.conditions?.length > 0 
            ? insights.conditions.map(c => c.name) 
            : ['No Clinical Data', 'System Baseline'],
        datasets: [{
            data: insights?.conditions?.length > 0 
                ? insights.conditions.map(c => c.count) 
                : [100, 1],
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#a855f7'],
            hoverOffset: 20,
            borderWidth: 0
        }]
    };

    const barData = {
        labels: insights?.goals?.length > 0 
            ? insights.goals.map(g => g.name) 
            : ['Weight Loss', 'Muscle Gain', 'Endurance', 'Recovery'],
        datasets: [{
            label: 'User Density',
            data: insights?.goals?.length > 0 
                ? insights.goals.map(g => g.count) 
                : [12, 8, 15, 5],
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 12,
            hoverBackgroundColor: '#6366f1'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 12
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: 'var(--text-secondary)', font: { weight: '600' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--text-secondary)', font: { weight: '600' } }
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-xl)' }}>
                        <Typography variant="h6" fontWeight={900} mb={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Timeline sx={{ color: '#10b981' }} /> Regional Activity Heatmap (Last 30D)
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 2 }}>
                            {(heatmapData?.length > 0 ? heatmapData : Array(30).fill({ count: 0 })).map((h, i) => (
                                <Tooltip key={i} title={`${h.date || 'Day ' + (i+1)}: ${h.count} actions`}>
                                    <Box
                                        sx={{
                                            aspectRatio: '1/1',
                                            borderRadius: '10px',
                                            bgcolor: h.count > 5 ? '#10b981' : h.count > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.03)',
                                            transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: h.count > 5 ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none',
                                            '&:hover': { transform: 'scale(1.15)', zIndex: 1, bgcolor: 'var(--primary)', cursor: 'pointer' }
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: 'rgba(255,255,255,0.03)' }} /> DORMANT
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: '#10b981' }} /> PEAK ACTIVITY
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className="glass-card" sx={{ p: 4, height: '100%', borderRadius: 'var(--radius-xl)' }}>
                        <Typography variant="h6" fontWeight={900} mb={4}>Condition Vector Dispersion</Typography>
                        <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text-secondary)', font: { weight: '800' } } } } }} />
                        </Box>
                    </Paper>
                </Grid>
                
                {/* New Plot: User Objectives */}
                <Grid item xs={12}>
                    <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-xl)' }}>
                        <Typography variant="h6" fontWeight={900} mb={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <AutoGraph sx={{ color: 'var(--primary)' }} /> User Health Objectives Distribution
                        </Typography>
                        <Box sx={{ height: 350 }}>
                            <Bar data={barData} options={chartOptions} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </motion.div>
    );
};

const FeedbackTab = ({ feedbacks }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper className="glass-card" sx={{ p: 3 }}>
            <Grid container spacing={2}>
                {feedbacks.map(f => (
                    <Grid item xs={12} key={f.id}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar>{f.user_name?.[0] || 'U'}</Avatar>
                                    <Box>
                                        <Typography fontWeight={900}>{f.user_name}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.6 }}>{new Date(f.date).toLocaleString()}</Typography>
                                    </Box>
                                </Stack>
                                <Rating value={f.rating} readOnly />
                            </Stack>
                            <Typography sx={{ mt: 2, pl: 7 }}>"{f.message}"</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 2, pl: 7 }}>
                                <Button size="small" variant="outlined" startIcon={<CheckCircle />}>Resolve</Button>
                                <Button size="small" variant="text">Respond Later</Button>
                            </Stack>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    </motion.div>
);

const LogsTab = ({ logs }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Paper className="glass-card" sx={{ p: 0 }}>
            <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--glass-border)' }}>
                <Typography variant="h6" fontWeight={900} display="flex" alignItems="center" gap={2}><Terminal /> System Audit Logs</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
                {logs.map(log => (
                    <Stack key={log.id} direction="row" spacing={3} alignItems="center" sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)', width: 80 }}>{new Date(log.time).toLocaleTimeString()}</Typography>
                        <Chip
                            label={log.level}
                            size="small"
                            variant="outlined"
                            color={log.level === 'ERROR' ? 'error' : log.level === 'WARNING' ? 'warning' : 'primary'}
                            sx={{ fontWeight: 900, minWidth: 80 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700, flexGrow: 1 }}>{log.message}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--primary)' }}>{log.user}</Typography>
                    </Stack>
                ))}
            </Box>
        </Paper>
    </motion.div>
);

const SettingsTab = ({ initialSettings }) => {
    const [settings, setSettings] = useState(initialSettings || {});
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/admin/settings', settings);
            alert("Settings saved successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to save settings");
        } finally { setSaving(false); }
    };

    const runDangerAction = async (endpoint) => {
        try {
            const res = await api.post(endpoint);
            alert(res.data.message || "Action executed successfully");
            setConfirmOpen(false);
        } catch (err) {
            console.error(err);
            alert("Action failed to execute");
        }
    };

    const triggerDanger = (action, endpoint) => {
        setActionToConfirm({ action, endpoint });
        setConfirmOpen(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Paper className="glass-card" sx={{ p: 4, borderRadius: 'var(--radius-xl)' }}>
                <Typography variant="h5" fontWeight={900} mb={4} display="flex" alignItems="center" gap={2}>
                    <SettingsIcon color="primary" sx={{ fontSize: 32 }} /> SYSTEM INFRASTRUCTURE
                </Typography>

                <Stack spacing={6}>
                    <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 3, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Science sx={{ color: 'var(--primary)' }} /> AI Intelligence Gateway
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, color: 'var(--text-secondary)', fontWeight: 600 }}>
                            Configure the primary discovery and reasoning keys for the system's neurological core.
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                                    <Typography variant="subtitle2" sx={{ minWidth: 200, fontWeight: 900, color: 'var(--text-secondary)' }}>
                                        OPENAI API KEY
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="sk-................................................"
                                        variant="outlined"
                                        value={settings.openai_key || ''}
                                        onChange={(e) => setSettings({ ...settings, openai_key: e.target.value })}
                                        sx={{ bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                                    <Typography variant="subtitle2" sx={{ minWidth: 200, fontWeight: 900, color: 'var(--text-secondary)' }}>
                                        GOOGLE GEMINI KEY
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        placeholder="AIza............................................"
                                        variant="outlined"
                                        value={settings.google_key || ''}
                                        onChange={(e) => setSettings({ ...settings, google_key: e.target.value })}
                                        sx={{ bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            disabled={saving}
                            startIcon={<CloudDone />}
                            sx={{ px: 4, py: 1.5, borderRadius: '14px', fontWeight: 900, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}
                        >
                            {saving ? "UPDATING CORE..." : "SAVE CONFIGURATION"}
                        </Button>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                    <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 3, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Security /> CRITICAL OVERRIDE ZONE
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button variant="outlined" color="error" fullWidth sx={{ py: 1.5, borderRadius: '12px', fontWeight: 800 }} onClick={() => triggerDanger("Clear Logs", "/admin/danger-zone/clear-logs")}>
                                    CLEAR LOGS
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button variant="outlined" color="error" fullWidth sx={{ py: 1.5, borderRadius: '12px', fontWeight: 800 }} onClick={() => triggerDanger("Reset Analytics", "/admin/danger-zone/reset-analytics")}>
                                    RESET ANALYTICS
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button variant="contained" color="error" fullWidth sx={{ py: 1.5, borderRadius: '12px', fontWeight: 800, bgcolor: '#f43f5e' }} onClick={() => triggerDanger("Purge Inactive Users", "/admin/danger-zone/remove-users")}>
                                    PURGE INACTIVE
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button variant="contained" color="error" fullWidth sx={{ py: 1.5, borderRadius: '12px', fontWeight: 800, bgcolor: '#f43f5e' }} onClick={() => triggerDanger("Wipe AI Memory", "/admin/danger-zone/reset-chat")}>
                                    WIPE AI MEMORY
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Stack>
            </Paper>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle sx={{ fontWeight: 900 }}>Confirm Action</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to perform the action: <b>{actionToConfirm?.action}</b>? This may be irreversible.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => runDangerAction(actionToConfirm.endpoint)}>Yes, Proceed</Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};

export default Admin;
