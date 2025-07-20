import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { config } from '../config/env';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any;
    stack?: string;
  };
}

// Handle Mongoose validation errors
const handleValidationError = (err: MongooseError.ValidationError): AppError => {
  const errors = Object.values(err.errors).map(error => ({
    field: error.path,
    message: error.message,
  }));

  return new AppError(
    'Validation failed',
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.VALIDATION_ERROR
  );
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  return new AppError(
    `${field} '${value}' already exists`,
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.ALREADY_EXISTS
  );
};

// Handle Mongoose cast errors (invalid ObjectId)
const handleCastError = (err: MongooseError.CastError): AppError => {
  return new AppError(
    `Invalid ${err.path}: ${err.value}`,
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.INVALID_INPUT
  );
};

// Handle JWT errors
const handleJWTError = (err: JsonWebTokenError): AppError => {
  if (err instanceof TokenExpiredError) {
    return new AppError(
      'Token has expired',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.INVALID_TOKEN
    );
  }
  
  return new AppError(
    'Invalid token',
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.INVALID_TOKEN
  );
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: {
      message: err.message,
      code: err.code,
      stack: err.stack,
    },
  };

  res.status(err.statusCode).json(errorResponse);
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Only send operational errors to client in production
  if (err.isOperational) {
    const errorResponse: ErrorResponse = {
      error: {
        message: err.message,
        code: err.code,
      },
    };

    res.status(err.statusCode).json(errorResponse);
  } else {
    // Log error and send generic message
    logger.error('Programming error:', err);

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Something went wrong',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    };

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error ${err.statusCode || 500}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Set default values if not set
  if (!error.statusCode) {
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
  if (!error.code) {
    error.code = ERROR_CODES.INTERNAL_ERROR;
  }
  if (!error.isOperational) {
    error.isOperational = false;
  }

  // Send error response
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );

  next(error);
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};