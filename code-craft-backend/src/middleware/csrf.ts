import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';
import { setCsrfCookie } from '../utils/cookies';

// Generate a secure CSRF token
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to generate and set CSRF token
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Generate CSRF token if not exists
  if (!req.cookies['csrf-token']) {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    req.csrfToken = csrfToken;
  } else {
    req.csrfToken = req.cookies['csrf-token'];
  }
  
  next();
};

// Middleware to verify CSRF token on state-changing requests
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for GET and HEAD requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const tokenFromCookie = req.cookies['csrf-token'];
  const tokenFromHeader = req.headers['x-csrf-token'] as string;
  
  if (!tokenFromCookie || !tokenFromHeader) {
    logger.warn('CSRF token missing', { 
      method: req.method, 
      path: req.path,
      hasCookie: !!tokenFromCookie,
      hasHeader: !!tokenFromHeader
    });
    
    res.status(HTTP_STATUS.FORBIDDEN).json({
      error: {
        message: 'CSRF token missing',
        code: ERROR_CODES.FORBIDDEN,
      },
    });
    return;
  }

  // Constant-time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(tokenFromCookie), Buffer.from(tokenFromHeader))) {
    logger.warn('CSRF token mismatch', { 
      method: req.method, 
      path: req.path 
    });
    
    res.status(HTTP_STATUS.FORBIDDEN).json({
      error: {
        message: 'Invalid CSRF token',
        code: ERROR_CODES.FORBIDDEN,
      },
    });
    return;
  }

  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}
