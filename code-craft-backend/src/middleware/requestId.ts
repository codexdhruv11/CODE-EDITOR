import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Middleware to add unique request ID for correlation tracking
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request ID is provided in headers (useful for distributed tracing)
  const existingRequestId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  
  // Generate new request ID or use existing one
  const requestId = existingRequestId?.toString() || uuidv4();
  
  // Attach request ID to request object
  req.requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Get request ID from request object
 */
export const getRequestId = (req: Request): string => {
  return req.requestId || 'unknown';
};
