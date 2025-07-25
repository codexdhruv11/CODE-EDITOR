import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { User } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';
import * as crypto from 'crypto';

// Get current user (for /auth/me endpoint)
export const getMe = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'User not authenticated',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }

    // Fetch fresh user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'User not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Remove password from response
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(HTTP_STATUS.OK).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Failed to get user data',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // Add small random delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          message: 'Registration failed', // Generic message to prevent user enumeration
          code: ERROR_CODES.VALIDATION_ERROR,
        },
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    // Generate JWT token
    const payload = { userId: user._id.toString() };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as StringValue });

    // Set httpOnly cookie with token
    setAuthCookie(res, token);

    // Remove password from response
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    logger.info(`New user registered: ${email}`);

    // For non-browser clients (mobile/API), include token in response
    const clientType = req.headers['x-client-type'] || req.headers['user-agent'];
    const isMobileOrAPI = clientType && (clientType === 'mobile' || clientType === 'api' || !clientType.includes('Mozilla'));

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      // Include token for non-browser clients
      ...(isMobileOrAPI && { token }),
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Registration failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Find user by email (with password field and lockout fields)
    const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil +sessionTokens');
    
    // Check if account is locked
    if (user && user.isLocked()) {
      // Add small random delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const lockTimeRemaining = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 1000 / 60);
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: `Account is locked due to too many failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }
    
    // Always perform password comparison to prevent timing attacks
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await user.comparePassword(password);
    } else {
      // Perform dummy password comparison to maintain consistent timing
      const dummyHash = '$2b$10$dummyhashtopreventtimingattacks';
      await User.comparePasswordStatic(password, dummyHash);
    }
    
    // Check if login is valid
    if (!user || !isPasswordValid) {
      // Increment failed login attempts if user exists
      if (user) {
        await user.incLoginAttempts();
      }
      
      // Add small random delay to further prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Invalid email or password',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }
    
    // Reset login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Generate JWT token
    const payload = { userId: user._id.toString() };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as StringValue });

    // Set httpOnly cookie with token
    setAuthCookie(res, token);

    // Remove password from response
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    logger.info(`User logged in: ${email}`);

    // For non-browser clients (mobile/API), include token in response
    const clientType = req.headers['x-client-type'] || req.headers['user-agent'];
    const isMobileOrAPI = clientType && (clientType === 'mobile' || clientType === 'api' || !clientType.includes('Mozilla'));

    res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      user: userWithoutPassword,
      // Include token for non-browser clients
      ...(isMobileOrAPI && { token }),
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Login failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Clear the auth cookie
    clearAuthCookie(res);
    
    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);
    
    res.status(HTTP_STATUS.OK).json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Logout failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
};
