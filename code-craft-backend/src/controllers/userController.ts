import { Request, Response } from 'express';
import { User, CodeExecution, Star } from '../models';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * User controller handling user-related operations
 * Removes all premium features - no isPro checks or upgradeToPro functionality
 */

/**
 * Sync user from authentication provider (Clerk webhook or manual sync)
 */
export const syncUser = catchAsync(async (req: Request, res: Response) => {
  const { clerkId, email, name } = req.body;

  if (!clerkId || !email || !name) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Missing required fields: clerkId, email, name',
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
  }

  try {
    // Check if user already exists
    let user = await User.findByClerkId(clerkId);

    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      await user.save();

      logger.info(`User updated: ${clerkId}`, { email, name });
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        name,
      });
      await user.save();

      logger.info(`User created: ${clerkId}`, { email, name });
    }

    res.status(HTTP_STATUS.OK).json({
      message: 'User synced successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('User sync failed:', error);
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: {
          message: 'User with this email already exists',
          code: ERROR_CODES.ALREADY_EXISTS,
        },
      });
    }

    throw error;
  }
});

/**
 * Get current authenticated user profile
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const user = await User.findByClerkId(req.user.clerkId);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  res.status(HTTP_STATUS.OK).json({
    user: user.toJSON(),
  });
});

/**
 * Update user profile information
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { name, email } = req.body;
  const user = await User.findByClerkId(req.user.clerkId);

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  // Update fields if provided
  if (name !== undefined) {
    user.name = name;
  }
  if (email !== undefined) {
    user.email = email;
  }

  await user.save();

  logger.info(`User profile updated: ${user.clerkId}`, { name, email });

  res.status(HTTP_STATUS.OK).json({
    message: 'User profile updated successfully',
    user: user.toJSON(),
  });
});

/**
 * Get user statistics including execution history and starred snippets
 */
export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.params;

  // Find user by ID or clerkId
  let user;
  if (userId.match(/^[0-9a-fA-F]{24}$/)) {
    // MongoDB ObjectId
    user = await User.findById(userId);
  } else {
    // Assume it's a clerkId
    user = await User.findByClerkId(userId);
  }

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  try {
    // Get execution statistics
    const executionStats = await CodeExecution.getUserStats(user._id.toString());

    // Get favorite language (most used)
    const languageStats = await CodeExecution.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const favoriteLanguage = languageStats.length > 0 ? languageStats[0]._id : null;

    // Get starred snippets count
    const starredCount = await Star.countDocuments({ userId: user._id });

    // Get recent executions
    const recentExecutions = await CodeExecution.getRecentExecutions(user._id.toString(), 5);

    const stats = {
      user: {
        id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      executions: {
        total: executionStats.totalExecutions,
        languagesUsed: executionStats.languagesUsed,
        favoriteLanguage,
        avgExecutionTime: executionStats.avgExecutionTime,
        last24Hours: executionStats.last24Hours,
        recent: recentExecutions,
      },
      snippets: {
        starred: starredCount,
      },
    };

    res.status(HTTP_STATUS.OK).json({ stats });
  } catch (error) {
    logger.error('Failed to get user stats:', error);
    throw error;
  }
});

/**
 * Get user's public profile (limited information)
 */
export const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.params;

  let user;
  if (userId.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(userId);
  } else {
    user = await User.findByClerkId(userId);
  }

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  // Return only public information
  const publicProfile = {
    id: user._id,
    name: user.name,
    createdAt: user.createdAt,
  };

  res.status(HTTP_STATUS.OK).json({ user: publicProfile });
});