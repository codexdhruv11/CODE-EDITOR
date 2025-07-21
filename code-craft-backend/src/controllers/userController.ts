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
 * Get current authenticated user profile
 */
export const getCurrentUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    user: user.toJSON(),
  });
});

/**
 * Update user profile information
 */
export const updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
    return;
  }

  // Update fields if provided
  if (name !== undefined) {
    user.name = name;
  }
  if (email !== undefined) {
    user.email = email;
  }

  await user.save();

  logger.info(`User profile updated: ${user._id}`, { name, email });

  res.status(HTTP_STATUS.OK).json({
    message: 'User profile updated successfully',
    user: user.toJSON(),
  });
});

/**
 * Get user statistics including execution history and starred snippets
 */
export const getUserStats = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = req.params;

  // Find user by MongoDB ObjectId
  const user = await User.findById(userId);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
    return;
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
export const getUserProfile = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id: userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
    return;
  }

  // Return only public information
  const publicProfile = {
    id: user._id,
    name: user.name,
    createdAt: user.createdAt,
  };

  res.status(HTTP_STATUS.OK).json({ user: publicProfile });
});