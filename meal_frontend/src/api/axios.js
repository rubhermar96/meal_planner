import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    },
});

// INTERCEPTOR: Se ejecuta antes de cada petición
api.interceptors.request.use(
    (config) => {
        // Buscamos el token en el almacenamiento local
        const token = localStorage.getItem('access_token');

        // Si existe, lo pegamos en la cabecera "Authorization"
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR: Se ejecuta cuando recibimos respuesta (para detectar si el token caducó)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el backend dice "401 Unauthorized" y no estamos en la página de login
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login'; // Forzamos logout
        }
        return Promise.reject(error);
    }
);

export default api;