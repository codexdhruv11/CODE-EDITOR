import { Request, Response } from 'express';
import { User, CodeExecution, Star } from '../models';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';
import { validateObjectId } from '../utils/sanitization';

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

  const user = await User.findById(req.user.id).lean();

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'User not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
    return;
  }

  // Remove password field from response
  const { password, ...userWithoutPassword } = user;

  res.status(HTTP_STATUS.OK).json({
    user: userWithoutPassword,
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

  const { name, email, bio } = req.body;
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
  if (bio !== undefined) {
    user.bio = bio;
  }

  await user.save();

  logger.info(`User profile updated: ${user._id}`, { name, email, bio: bio ? 'updated' : 'unchanged' });

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

  // Validate user ID
  const validUserId = validateObjectId(userId);
  if (!validUserId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid user ID format',
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
    return;
  }

  // Find user by MongoDB ObjectId using lean() for better performance
  const user = await User.findById(validUserId).lean();

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
    // Use aggregation pipeline for better performance instead of multiple queries
    const [executionStats, languageStats, starredCount] = await Promise.all([
      CodeExecution.aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: null,
            totalExecutions: { $sum: 1 },
            avgExecutionTime: { $avg: '$executionTime' },
            languagesUsed: { $addToSet: '$language' },
            last24Hours: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      CodeExecution.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      Star.countDocuments({ userId: user._id })
    ]);

    const favoriteLanguage = languageStats.length > 0 ? languageStats[0]._id : null;
    const stats = executionStats[0] || {
      totalExecutions: 0,
      avgExecutionTime: 0,
      languagesUsed: [],
      last24Hours: 0
    };

    // Get recent executions with lean() for better performance
    const recentExecutions = await CodeExecution.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const userStats = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      executions: {
        total: stats.totalExecutions,
        languagesUsed: stats.languagesUsed?.length || 0,
        favoriteLanguage,
        avgExecutionTime: Math.round(stats.avgExecutionTime || 0),
        last24Hours: stats.last24Hours,
        recent: recentExecutions,
      },
      snippets: {
        starred: starredCount,
      },
    };

    res.status(HTTP_STATUS.OK).json({ stats: userStats });
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

  // Validate user ID
  const validUserId = validateObjectId(userId);
  if (!validUserId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid user ID format',
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
    return;
  }

  const user = await User.findById(validUserId).lean();

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