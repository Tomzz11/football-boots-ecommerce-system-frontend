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
        const message = error.response?.data?.message || `เกิดข้อผิดพลาด กรุณาลองใหม่`;

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            if (window.location.pathname !== '/login') {
                toast.error('กรุณาเข้าสู่ระบบใหม่');
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('คุณไม่มีสิทธิ์เข้าถึง');
        } else if (error.response?.status === 404) {
            toast.error('ไม่พบข้อมูล');
        } else if (error.response?.status === 500) {
            toast.error('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง');
        }
        return Promise.reject(error);
    }
);

export default api;

