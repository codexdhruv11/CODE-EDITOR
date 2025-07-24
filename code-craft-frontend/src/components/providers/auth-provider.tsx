'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Mark as hydrated first
    setIsHydrated(true);
    
    // Initialize auth on app start
    const init = async () => {
      // Rehydrate the store first
      await useAuthStore.persist.rehydrate();
      // Then initialize auth
      await initializeAuth();
    };
    
    init();
  }, [initializeAuth]);

  // During SSR or before hydration, just render children
  return <>{children}</>;
}
