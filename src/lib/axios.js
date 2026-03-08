import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL:  import.meta.env.VITE_API_URL || '/api',
    headers: {
    'Content-Type': 'application/json',
  },
    withCredentials: true, 
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (window.location.pathname !== '/login') {
                toast.error('กรุณาเข้าสู่ระบบใหม่');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

