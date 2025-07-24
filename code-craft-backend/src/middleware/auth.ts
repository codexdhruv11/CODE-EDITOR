import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { validateObjectId } from '../utils/sanitization';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

// Authentication middleware using JWT
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from cookie (browser clients) or Authorization header (mobile/API clients)
    let token = req.cookies['auth-token'];
    
    // If no cookie token, check Authorization header for mobile/API clients
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Authorization token required',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      
      // Validate the userId from token
      const validUserId = validateObjectId(decoded.userId);
      if (!validUserId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: {
            message: 'Invalid user ID in token',
            code: ERROR_CODES.INVALID_TOKEN,
          },
        });
        return;
      }
      
      const user = await User.findById(validUserId).lean();
      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: {
            message: 'User not found',
            code: ERROR_CODES.UNAUTHORIZED,
          },
        });
        return;
      }

      req.user = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    } catch (jwtError) {
      logger.error('JWT token verification failed:', jwtError);
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Invalid token',
          code: ERROR_CODES.INVALID_TOKEN,
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Authentication failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};

// Optional authentication middleware for public endpoints that can benefit from user context
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract token from cookie (browser clients) or Authorization header (mobile/API clients)
    let token = req.cookies['auth-token'];
    
    // If no cookie token, check Authorization header for mobile/API clients
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      // No token provided, continue without user context
      next();
      return;
    }

    // Try to authenticate but don't fail if it doesn't work
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      const validUserId = validateObjectId(decoded.userId);
      
      if (validUserId) {
        const user = await User.findById(validUserId).lean();
        
        if (user) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        }
      }
    } catch (error) {
      // Ignore authentication errors for optional auth
      logger.debug('Optional authentication failed:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};