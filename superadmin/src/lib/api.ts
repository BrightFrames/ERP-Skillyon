import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const apiBase = isLocal 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_API_URL || 'https://erp-skillyon-b.vercel.app').replace(/\/$/, '');
const api = axios.create({
  baseURL: `${apiBase}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    if (window.location.pathname !== '/login') {
      localStorage.removeItem('sa_token');
      localStorage.removeItem('sa_user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
