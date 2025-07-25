import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Hydration-safe date formatting that returns consistent values
 * between server and client by avoiding relative time on initial render
 */
export function formatDateSafe(date: string | Date, formatStr: string = 'PP'): string {
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Hydration-safe relative date formatting
 * Returns absolute date during SSR, relative date after hydration
 */
export function formatRelativeDateSafe(date: string | Date, isClient: boolean = false): string {
  try {
    const dateObj = new Date(date);
    
    // During SSR or if not client, return absolute date
    if (!isClient || typeof window === 'undefined') {
      return format(dateObj, 'PPp'); // e.g., "Apr 29, 2023 at 10:30 AM"
    }
    
    // After hydration, show relative time
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Hook to get hydration-safe relative dates
 */
export function useRelativeDate(date: string | Date): string {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return formatRelativeDateSafe(date, isClient);
}

// Re-export for convenience
export { format } from 'date-fns';
