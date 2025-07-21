'use client';

// ReactBits animations - fallback to custom implementations if package not available
let fadeIn, slideUp, slideDown, slideLeft, slideRight, scaleIn, staggerContainer, staggerItem, bounceIn, rotateIn;

try {
  const reactBits = require('@appletosolutions/reactbits');
  ({ fadeIn, slideUp, slideDown, slideLeft, slideRight, scaleIn, staggerContainer, staggerItem, bounceIn, rotateIn } = reactBits);
} catch (error) {
  // Fallback implementations if ReactBits is not available
  console.warn('ReactBits not available, using fallback animations');
}

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

// Fallback animation variants if ReactBits is not available
const fallbackAnimations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  slideUp: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  },
  slideDown: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  },
  slideLeft: {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } }
  },
  slideRight: {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.4 } }
  },
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  staggerItem: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  bounceIn: {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    }
  },
  rotateIn: {
    hidden: { rotate: -180, opacity: 0 },
    visible: { rotate: 0, opacity: 1, transition: { duration: 0.5 } }
  }
};

// Export animations (ReactBits if available, fallback otherwise)
export {
  fadeIn: fadeIn || fallbackAnimations.fadeIn,
  slideUp: slideUp || fallbackAnimations.slideUp,
  slideDown: slideDown || fallbackAnimations.slideDown,
  slideLeft: slideLeft || fallbackAnimations.slideLeft,
  slideRight: slideRight || fallbackAnimations.slideRight,
  scaleIn: scaleIn || fallbackAnimations.scaleIn,
  staggerContainer: staggerContainer || fallbackAnimations.staggerContainer,
  staggerItem: staggerItem || fallbackAnimations.staggerItem,
  bounceIn: bounceIn || fallbackAnimations.bounceIn,
  rotateIn: rotateIn || fallbackAnimations.rotateIn
};

/**
 * Custom animation variants for Framer Motion (fallback if ReactBits not available)
 */
export const fadeInFallback: AnimationVariants = {
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