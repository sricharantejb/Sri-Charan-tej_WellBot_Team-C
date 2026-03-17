import axios from 'axios';

const API_URL = 'http://localhost:5100/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("401 Unauthorized detected - redirecting to login");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const loginWithGoogle = async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken });
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const fetchDashboardData = () => api.get('/dashboard');
export const uploadReport = (formData) => api.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const fetchReports = () => api.get('/reports');
export const fetchRecoveryPlan = () => api.get('/plan');
export const updateProgress = (data) => api.post('/progress', data);
export const fetchReminders = () => api.get('/reminders');
export const addReminder = (data) => api.post('/reminders', data);
export const sendChatMessage = (message) => api.post('/chat', { message });
export const fetchChatHistory = () => api.get('/chat/history');
export const fetchProfile = () => api.get('/profile');
export const updateProfile = (data) => api.post('/profile', data);

export default api;
