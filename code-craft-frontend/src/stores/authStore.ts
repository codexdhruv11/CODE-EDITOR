import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/api';
import { authApi } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';

interface DecodedToken {
  userId: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
        });
        
        // Store token in localStorage for API interceptors
        localStorage.setItem('token', token);
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Remove token from localStorage
        localStorage.removeItem('token');
      },
      
      checkAuth: () => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired
          if (decodedToken.exp < currentTime) {
            get().logout();
            return false;
          }
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
); 