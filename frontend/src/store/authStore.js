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
    } catch (error) {
      // If unauthorized, user stays null, but loading stops
      set({ user: null, isLoading: false ,error: error.message});
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
      set({ error: error.response?.data?.message || 'Login failed' });
      return { success: false, error: error.response?.data?.message };
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
      set({ error: error.response?.data?.message || 'Registration failed' });
      return { success: false, error: error.response?.data?.message };
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