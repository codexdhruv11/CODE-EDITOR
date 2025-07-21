import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

// Enhanced rate limiting with IP tracking and progressive penalties
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    violations: number;
    lastViolation: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 3600000);

// Progressive penalty system
const getProgressivePenalty = (violations: number): number => {
  if (violations <= 1) return 1;
  if (violations <= 3) return 2;
  if (violations <= 5) return 5;
  return 10; // Maximum 10x penalty
};

// Enhanced rate limiter with progressive penalties
export const createAdvancedRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: (req: Request) => {
      const key = req.ip || 'unknown';
      const entry = store[key];
      
      if (!entry) return options.max;
      
      // Apply progressive penalty
      const penalty = getProgressivePenalty(entry.violations);
      return Math.max(1, Math.floor(options.max / penalty));
    },
    
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip || 'unknown';
    },
    
    handler: (req: Request, res: Response) => {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      // Track violations
      if (!store[key]) {
        store[key] = { count: 0, resetTime: now + options.windowMs, violations: 0, lastViolation: 0 };
      }
      
      store[key].violations++;
      store[key].lastViolation = now;
      
      // Log security event
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        violations: store[key].violations,
      });
      
      const retryAfter = Math.ceil(options.windowMs / 1000);
      
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        error: {
          message: options.message,
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          retryAfter,
          violations: store[key].violations,
        },
      });
    },
    
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
  });
};

// Suspicious activity detector
export const suspiciousActivityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Very high limit for normal users
  
  keyGenerator: (req: Request) => req.ip || 'unknown',
  
  handler: (req: Request, res: Response) => {
    // Log potential attack
    logger.error('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      headers: req.headers,
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error: {
        message: 'Suspicious activity detected. Access temporarily restricted.',
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        retryAfter: 900, // 15 minutes
      },
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});

// Brute force protection for authentication endpoints
export const authBruteForceProtection = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  
  keyGenerator: (req: Request) => {
    // Combine IP and email for more targeted protection
    const email = req.body?.email || '';
    return `${req.ip || 'unknown'}:${email}`;
  },
  
  skipSuccessfulRequests: true, // Don't count successful logins
  
  handler: (req: Request, res: Response) => {
    logger.warn('Brute force attempt detected', {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error: {
        message: 'Too many failed login attempts. Please try again later.',
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        retryAfter: 900,
      },
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});