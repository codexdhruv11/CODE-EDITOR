'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Protected routes that require authentication
const protectedRoutes = [
  '/editor',
  '/profile',
  '/snippets/starred',
  '/snippets/create',
  '/executions',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login',
  '/register',
];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;
    
    // Don't redirect while loading
    if (isLoading) return;

    // Check if the route is protected and user is not authenticated
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
      const url = `/login?from=${encodeURIComponent(pathname)}`;
      router.push(url);
      return;
    }

    // Check if user is already authenticated and trying to access auth routes
    if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router, isClient]);

  // During SSR or before client hydration, always render children
  // This prevents hydration mismatches
  if (!isClient) {
    return <>{children}</>;
  }

  // Show loading while checking authentication on client
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" data-testid="loading-spinner"></div>
          <p data-testid="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
