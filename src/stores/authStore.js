import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import useCartStore from './cartStore';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => {
        if (user?._id) {
          useCartStore.getState().syncCartOwner(user._id);
        } else {
          useCartStore.getState().syncCartOwner(null);
        }

        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data;

          get().setToken(token);
          useCartStore.getState().syncCartOwner(user._id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('ลงทะเบียนสำเร็จ!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'ลงทะเบียนไม่สำเร็จ';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', credentials);
          const { user, token } = response.data;

          get().setToken(token);
          useCartStore.getState().syncCartOwner(user._id);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`ยินดีต้อนรับ ${user.name}`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // ignore error, logout anyway
        }

        get().setToken(null);
        useCartStore.getState().syncCartOwner(null);

        set({
          user: null,
          isAuthenticated: false,
        });

        toast.success('ออกจากระบบแล้ว');
      },

      // Get current user profile
      getProfile: async () => {
        try {
          const response = await api.get('/auth/me');
          const user = response.data.user;

          useCartStore.getState().syncCartOwner(user._id);

          set({
            user,
            isAuthenticated: true,
          });

          return user;
        } catch (error) {
          await get().logout();
          return null;
        }
      },

      // Update profile
      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', data);
          const updatedUser = response.data.user;

          useCartStore.getState().syncCartOwner(updatedUser._id);

          set({
            user: updatedUser,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('อัพเดตโปรไฟล์สำเร็จ');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'อัพเดทไม่สำเร็จ';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/password', data);

          if (response.data.token) {
            get().setToken(response.data.token);
          }

          set({ isLoading: false });
          toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Check if user is admin
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

