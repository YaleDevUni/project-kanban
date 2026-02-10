import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    localStorage.setItem('jwt_token', token);
    set({ user, token, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem('jwt_token');
    set({ user: null, token: null, isLoading: false });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
