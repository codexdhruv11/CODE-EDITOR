'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouchDevice: boolean;
}

export function useResponsive(): ResponsiveState {
  // Default to mobile first approach for SSR
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isPortrait: true,
    isLandscape: false,
    isTouchDevice: false,
  });
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true);
    
    // Check for touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Initial check
    const checkBreakpoint = () => {
      // Get current window width
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;
      const isLandscape = !isPortrait;

      // Check breakpoints (must match tailwind.config.ts)
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1280;
      const isDesktop = width >= 1280;

      // Determine current breakpoint
      let breakpoint: Breakpoint = 'mobile';
      if (isDesktop) breakpoint = 'desktop';
      else if (isTablet) breakpoint = 'tablet';

      setState({
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
        isTouchDevice,
      });
    };

    // Run on mount and on window resize
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  // Return default mobile state during SSR to prevent hydration mismatch
  if (!isClient) {
    return {
      breakpoint: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isPortrait: true,
      isLandscape: false,
      isTouchDevice: false,
    };
  }

  return state;
} 