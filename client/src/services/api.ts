import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      if (path.startsWith('/profile') || path.startsWith('/checkout') || path.startsWith('/staff') || path.startsWith('/admin') || path.startsWith('/orders')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api
