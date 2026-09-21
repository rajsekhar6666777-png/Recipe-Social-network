import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('recipe_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clean stale auth data if token expired or invalid
      if (localStorage.getItem('recipe_token')) {
        localStorage.removeItem('recipe_token');
        localStorage.removeItem('recipe_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
