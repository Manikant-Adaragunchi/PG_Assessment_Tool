import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend URL
});

api.interceptors.response.use(
    response => {
        console.log('API Response:', response);
        return response;
    },
    error => {
        console.log('API Error:', error);
        return Promise.reject(error);
    }
);

// Request interceptor to add Bearer token
api.interceptors.request.use(async (config) => {
    try {
        // Native Auth: Token is in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error("Token fetch error", error);
    }
    return config;
});

export default api;
