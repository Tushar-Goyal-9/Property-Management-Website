import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true, // Start with true
  error: null,

checkAuth: async () => {
  try {
    const { data } = await api.get('/auth/me');
    set({ user: data, isLoading: false });
  } catch {
    // Normal for guests – don't set a global error
    set({ user: null, isLoading: false });
  }
},

  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      set({ user: data, error: null });
      return { success: true };
    } catch (error) {
  const data = error.response?.data;

  const errorMessage =
    data?.errors?.[0]?.msg ||
    data?.message ||
    "Login failed";

  set({ error: errorMessage });

  return {
    success: false,
    error: errorMessage,
  };
}
  },

    register: async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      set({ user: data, error: null });
      return { success: true };
    } catch (error) {
  const data = error.response?.data;

  const errorMessage =
    data?.errors?.[0]?.msg ||
    data?.message ||
    "Registration failed";

  set({ error: errorMessage });

  return {
    success: false,
    error: errorMessage,
  };
}
  },


  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;