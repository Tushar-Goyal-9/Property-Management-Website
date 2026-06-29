import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Do NOT auto-redirect on 401; just reject the promise
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or from Zustand store

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Intercept and format validation errors for a premium user experience
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const validationMessages = data.errors.map(err => err.msg).join('\n');
        data.message = validationMessages;
        data.errors = [{ msg: validationMessages }];
      }
    }
    return Promise.reject(error);
  }
);

export default api;