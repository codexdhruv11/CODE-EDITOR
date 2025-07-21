import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMITS, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

// Helper function to create rate limiters
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: any;
  useAuth?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: options.useAuth ? authKeyGenerator : ((req: Request) => req.ip || 'unknown'),
    handler: rateLimitHandler,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message,
  });
};

// Custom key generator for authenticated endpoints
const authKeyGenerator = (req: Request): string => {
  // Use user ID if authenticated, otherwise fall back to IP
  return req.user?.id || req.ip || 'unknown';
};

// Custom error handler for rate limiting
const rateLimitHandler = (req: Request, res: Response) => {
  logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
  
  return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    error: {
      message: 'Too many requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(RATE_LIMITS.GENERAL_API.windowMs / 1000),
    },
  });
};

// Code execution rate limiter (strictest)
export const codeExecutionLimiter = rateLimit({
  windowMs: RATE_LIMITS.CODE_EXECUTION.windowMs,
  max: RATE_LIMITS.CODE_EXECUTION.max,
  keyGenerator: authKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many code execution requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(RATE_LIMITS.CODE_EXECUTION.windowMs / 1000),
    },
  },
});

// Snippet creation rate limiter
export const snippetCreationLimiter = rateLimit({
  windowMs: RATE_LIMITS.SNIPPET_CREATION.windowMs,
  max: RATE_LIMITS.SNIPPET_CREATION.max,
  keyGenerator: authKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many snippet creation requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(RATE_LIMITS.SNIPPET_CREATION.windowMs / 1000),
    },
  },
});

// Comment creation rate limiter
export const commentLimiter = rateLimit({
  windowMs: RATE_LIMITS.COMMENT_CREATION.windowMs,
  max: RATE_LIMITS.COMMENT_CREATION.max,
  keyGenerator: authKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many comment requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(RATE_LIMITS.COMMENT_CREATION.windowMs / 1000),
    },
  },
});

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.GENERAL_API.windowMs,
  max: RATE_LIMITS.GENERAL_API.max,
  keyGenerator: (req: Request) => req.ip || 'unknown',
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: Math.ceil(RATE_LIMITS.GENERAL_API.windowMs / 1000),
    },
  },
});

// Star/unstar rate limiter (moderate)
export const starLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 stars per minute
  keyGenerator: authKeyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many star/unstar requests, please try again later',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: 60,
    },
  },
});

// Webhook rate limiter (for external services)
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 webhook calls per minute
  keyGenerator: (req: Request) => req.ip || 'unknown',
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many webhook requests',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      retryAfter: 60,
    },
  },
});