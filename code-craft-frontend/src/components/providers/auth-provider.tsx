'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth on app start
    const init = async () => {
      // Rehydrate the store first
      await useAuthStore.persist.rehydrate();
      // Then initialize auth
      await initializeAuth();
    };
    
    init();
  }, [initializeAuth]);

  return <>{children}</>;
}