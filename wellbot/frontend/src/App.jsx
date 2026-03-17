import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Plan from './pages/Plan';
import Reminders from './pages/Reminders';
import History from './pages/History';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import LandingPage from './pages/LandingPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

// Global axios interceptor for auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const getMuiTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f8fafc' : '#1e293b',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
  }
});

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  const isAuthenticated = token && token !== 'undefined' && token !== 'null' && user && user !== 'undefined' && user !== 'null';

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const Layout = ({ isSidebarCollapsed, setIsSidebarCollapsed, themeMode, toggleTheme }) => {
  const { pathname } = useLocation();
  const isAdminPath = pathname.startsWith('/admin');

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          ml: {
            xs: '80px',
            md: isSidebarCollapsed ? '80px' : '280px'
          },
          minHeight: '100vh',
          transition: 'margin 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          width: '100%'
        }}
      >
        <Outlet />
      </Box>
      {!isAdminPath && <ChatWidget />}
    </Box>
  );
};

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [themeMode, setThemeMode] = React.useState(localStorage.getItem('wellbot_theme') || 'dark');
  const clientId = "254016489653-vn6vq93s6dd9sklq69gbl9tj07gr26vl.apps.googleusercontent.com";

  React.useEffect(() => {
    document.body.setAttribute('data-theme', themeMode);
    localStorage.setItem('wellbot_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = React.useMemo(() => getMuiTheme(themeMode), [themeMode]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />

            <Route element={<PrivateRoute />}>
              <Route element={<Layout
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                themeMode={themeMode}
                toggleTheme={toggleTheme}
              />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="chat" element={<Chat />} />
                <Route path="upload" element={<Upload />} />
                <Route path="plan" element={<Plan />} />
                <Route path="reminders" element={<Reminders />} />
                <Route path="history" element={<History />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin/*" element={<Admin />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
