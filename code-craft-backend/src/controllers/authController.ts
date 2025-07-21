import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { User } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

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
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          message: 'User with this email already exists',
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

    // Remove password from response
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    logger.info(`New user registered: ${email}`);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
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

    // Find user by email (with password field)
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Invalid email or password',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          message: 'Invalid email or password',
          code: ERROR_CODES.UNAUTHORIZED,
        },
      });
    }

    // Generate JWT token
    const payload = { userId: user._id.toString() };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as StringValue });

    // Remove password from response
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    logger.info(`User logged in: ${email}`);

    res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
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