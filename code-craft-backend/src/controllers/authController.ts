import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';

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
    const payload = { userId: (user._id as any).toString() };
    const secret = config.jwtSecret;
    // @ts-ignore
    const token = jwt.sign(payload, secret, { expiresIn: config.jwtExpiresIn });

    // Remove password from response
    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    logger.info(`New user registered: ${email}`);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully',
      user: userResponse,
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
    const payload = { userId: (user._id as any).toString() };
    const secret = config.jwtSecret;
    // @ts-ignore
    const token = jwt.sign(payload, secret, { expiresIn: config.jwtExpiresIn });

    // Remove password from response
    const userResponse = user.toJSON();
    delete (userResponse as any).password;

    logger.info(`User logged in: ${email}`);

    res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      user: userResponse,
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