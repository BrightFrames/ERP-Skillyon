import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const apiBase = isLocal 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_API_URL || 'https://erp-skillyon-b.vercel.app').replace(/\/$/, '');
const api = axios.create({
  baseURL: `${apiBase}/api`,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // If not on login page, force logout
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;