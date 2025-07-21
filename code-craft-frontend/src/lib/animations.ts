'use client';

import { useEffect, useState } from 'react';
import { AnimationVariants } from '@/types/ui';
import { ANIMATION_PRIORITIES } from './constants';

/**
 * Check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for the prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Add listener for changes
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Base animation variants for Framer Motion
 */
export const fadeIn: AnimationVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

export const slideUp: AnimationVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    y: 10,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const slideIn: AnimationVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    x: -10,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const scale: AnimationVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.9
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Staggered animation for lists
 */
export const staggeredList: AnimationVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggeredItem: AnimationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
};

/**
 * Mobile bottom sheet animation
 */
export const bottomSheet: AnimationVariants = {
  hidden: { 
    opacity: 0,
    y: '100%'
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    y: '100%',
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Sidebar animation
 */
export const sidebar: AnimationVariants = {
  hidden: { 
    opacity: 0,
    x: '-100%'
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    x: '-100%',
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Page transition animation
 */
export const pageTransition: AnimationVariants = {
  hidden: { 
    opacity: 0
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeOut',
      when: 'beforeChildren'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Get animation variants based on user preferences
 */
export function getAccessibleAnimationVariants(
  variants: AnimationVariants,
  prefersReducedMotion: boolean
): AnimationVariants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.1 } },
      exit: { opacity: 0, transition: { duration: 0.1 } },
    };
  }
  return variants;
}

/**
 * Animation collection
 */
const animations = {
  fadeIn,
  slideUp,
  slideIn,
  scale,
  staggeredList,
  staggeredItem,
  bottomSheet,
  sidebar,
  pageTransition
};

/**
 * Check if an animation should be enabled based on priority
 */
export function isAnimationEnabled(priority: 'P1' | 'P2', type: string): boolean {
  if (useReducedMotion()) return false;
  
  // @ts-ignore - We know the structure matches
  return ANIMATION_PRIORITIES[priority][type];
} 