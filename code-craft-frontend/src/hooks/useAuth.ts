'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DecodedToken {
  userId: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const decodedToken = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          
          // Check if token is expired
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
            return;
          }
          
          // Fetch user data
          const user = await fetchUserData(token);
          
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      }
    };
    
    initializeAuth();
  }, []);

  // Mock function to fetch user data
  const fetchUserData = async (token: string): Promise<User> => {
    // This would be replaced with actual API call
    // e.g. const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    
    // Simulate API call
    return {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    };
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      
      // Simulate successful login
      const token = 'mock-jwt-token';
      const user = {
        id: '123',
        name: 'John Doe',
        email,
      };
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Invalid credentials' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      // const data = await response.json();
      
      // Simulate successful registration
      const token = 'mock-jwt-token';
      const user = {
        id: '123',
        name,
        email,
      };
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    // Clear token from storage
    localStorage.removeItem('token');
    
    // Reset state
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    // Redirect to login page
    router.push('/login');
  }, [router]);

  return {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  };
} 