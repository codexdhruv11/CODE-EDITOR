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
      try {
        // Rehydrate the store first
        await useAuthStore.persist.rehydrate();
        // Small delay to ensure hydration is complete
        await new Promise(resolve => setTimeout(resolve, 100));
        // Then initialize auth
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    init();
  }, [initializeAuth]);

  // During SSR or before hydration, just render children
  // This prevents hydration mismatches
  return <div suppressHydrationWarning={!isHydrated}>{children}</div>;
}
