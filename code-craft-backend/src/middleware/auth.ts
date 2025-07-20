import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkId: string;
        email: string;
        name: string;
      };
    }
  }
}

// Authentication middleware using Clerk (if available) or custom JWT
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Authorization token required',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // If using Clerk
    if (config.clerkSecretKey) {
      try {
        // For Clerk, we would typically use @clerk/express middleware
        // This is a simplified version - in production, use proper Clerk middleware
        const decoded = jwt.verify(token, config.clerkSecretKey) as any;
        
        const user = await User.findByClerkId(decoded.sub);
        if (!user) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: {
              message: 'User not found',
              code: ERROR_CODES.UNAUTHORIZED,
            },
          });
        }

        req.user = {
          id: user._id.toString(),
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
        };
      } catch (clerkError) {
        logger.error('Clerk token verification failed:', clerkError);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: {
            message: 'Invalid token',
            code: ERROR_CODES.INVALID_TOKEN,
          },
        });
      }
    } 
    // If using custom JWT
    else if (config.jwtSecret) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: {
              message: 'User not found',
              code: ERROR_CODES.UNAUTHORIZED,
            },
          });
        }

        req.user = {
          id: user._id.toString(),
          clerkId: user.clerkId,
          email: user.email,
          name: user.name,
        };
      } catch (jwtError) {
        logger.error('JWT token verification failed:', jwtError);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: {
            message: 'Invalid token',
            code: ERROR_CODES.INVALID_TOKEN,
          },
        });
      }
    } else {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: {
          message: 'Authentication not configured',
          code: ERROR_CODES.INTERNAL_ERROR,
        },
      });
    }

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Authentication failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};

// Optional authentication middleware for public endpoints that can benefit from user context
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      return next();
    }

    const token = authHeader.substring(7);

    // Try to authenticate but don't fail if it doesn't work
    try {
      if (config.clerkSecretKey) {
        const decoded = jwt.verify(token, config.clerkSecretKey) as any;
        const user = await User.findByClerkId(decoded.sub);
        
        if (user) {
          req.user = {
            id: user._id.toString(),
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
          };
        }
      } else if (config.jwtSecret) {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        const user = await User.findById(decoded.userId);
        
        if (user) {
          req.user = {
            id: user._id.toString(),
            clerkId: user.clerkId,
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