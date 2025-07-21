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
  
  // New methods for complete auth flow
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithCredentials: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Start with false to prevent infinite loading
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Remove token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
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

      // Complete auth flow methods
      loginWithCredentials: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { token, user } = await authApi.login(email, password);
          
          get().login(token, user);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('Login error details:', error);
          let errorMessage = 'Login failed';
          
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as any;
            errorMessage = axiosError.response?.data?.error?.message || axiosError.message || 'Login failed';
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      registerWithCredentials: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { token, user } = await authApi.register(name, email, password);
          
          get().login(token, user);
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Get token from localStorage if not in state
          const currentState = get();
          let token = currentState.token;
          
          if (!token && typeof window !== 'undefined') {
            token = localStorage.getItem('token');
            if (token) {
              set({ token });
            }
          }
          
          if (token) {
            // Check if token is valid
            const isValid = get().checkAuth();
            if (isValid) {
              try {
                // Fetch fresh user data
                const userData = await authApi.getMe();
                set({ 
                  user: userData.user, 
                  isAuthenticated: true,
                  isLoading: false 
                });
                return;
              } catch (error) {
                // If API call fails, clear invalid token
                get().logout();
              }
            }
          }
          
          // No valid token found
          set({ 
            isLoading: false, 
            isAuthenticated: false,
            user: null,
            token: null 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            isAuthenticated: false,
            user: null,
            token: null 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      skipHydration: true,
    }
  )
); 