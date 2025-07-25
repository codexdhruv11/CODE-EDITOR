'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationSafeProvider({ 
  children, 
  fallback = <div className="min-h-screen bg-background"></div> 
}: HydrationSafeProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated on mount
    setIsHydrated(true);
  }, []);

  // During SSR, render fallback
  if (!isHydrated) {
    return <>{fallback}</>;
  }

  // After hydration, render children
  return <>{children}</>;
}
