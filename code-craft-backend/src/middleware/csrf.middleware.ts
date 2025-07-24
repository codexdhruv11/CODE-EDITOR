import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { logger } from '../utils/logger';

interface CsrfRequest extends Request {
  csrfToken?: string;
}

// Generate a CSRF token
export const generateCsrfToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Middleware to generate and set CSRF token
export const setCsrfToken = (req: CsrfRequest, res: Response, next: NextFunction) => {
  if (!req.cookies['csrf-token']) {
    const token = generateCsrfToken();
    res.cookie('csrf-token', token, {
      httpOnly: false, // Must be false so frontend can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies['csrf-token'];
  }
  next();
};

// Middleware to verify CSRF token
export const verifyCsrfToken = (req: CsrfRequest, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'] as string;
  const tokenFromCookie = req.cookies['csrf-token'];

  logger.debug('CSRF verification', {
    method: req.method,
    url: req.url,
    hasHeaderToken: !!tokenFromHeader,
    hasCookieToken: !!tokenFromCookie,
  });

  if (!tokenFromHeader || !tokenFromCookie) {
    logger.warn('CSRF token missing', {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token missing',
    });
  }

  if (tokenFromHeader !== tokenFromCookie) {
    logger.warn('CSRF token mismatch', {
      method: req.method,
      url: req.url,
      ip: req.ip,
    });
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token invalid',
    });
  }

  next();
};
