import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Star, Snippet } from '../models';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Star controller handling snippet starring functionality
 */

/**
 * Toggle star on snippet
 */
export const toggleStar = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id: snippetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(snippetId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    // Verify snippet exists
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Toggle star
    const result = await Star.toggle(req.user.id, snippetId);

    logger.info(`Star toggled`, {
      snippetId,
      userId: req.user.id,
      isStarred: result.isStarred,
      starCount: result.starCount,
    });

    res.status(HTTP_STATUS.OK).json({
      message: result.isStarred ? 'Snippet starred' : 'Snippet unstarred',
      isStarred: result.isStarred,
      starCount: result.starCount,
    });
  } catch (error) {
    logger.error('Failed to toggle star:', error);
    throw error;
  }
});

/**
 * Get star count for snippet
 */
export const getStarCount = catchAsync(async (req: Request, res: Response) => {
  const { id: snippetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(snippetId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    // Verify snippet exists
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    const starCount = await Star.getStarCount(snippetId);

    res.status(HTTP_STATUS.OK).json({ starCount });
  } catch (error) {
    logger.error('Failed to get star count:', error);
    throw error;
  }
});

/**
 * Check if user starred snippet
 */
export const isStarredByUser = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id: snippetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(snippetId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    // Verify snippet exists
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    const isStarred = await Star.isStarredBy(req.user.id, snippetId);

    res.status(HTTP_STATUS.OK).json({ isStarred });
  } catch (error) {
    logger.error('Failed to check star status:', error);
    throw error;
  }
});

/**
 * Get users who starred snippet (optional feature)
 */
export const getSnippetStars = catchAsync(async (req: Request, res: Response) => {
  const { id: snippetId } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(snippetId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    // Verify snippet exists
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Get stars with user information
    const [stars, total] = await Promise.all([
      Star.find({ snippetId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name clerkId createdAt'),
      Star.countDocuments({ snippetId }),
    ]);

    const users = stars.map(star => ({
      id: star.userId._id,
      name: star.userId.name,
      clerkId: star.userId.clerkId,
      starredAt: star.createdAt,
    }));

    res.status(HTTP_STATUS.OK).json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Failed to get snippet stars:', error);
    throw error;
  }
});

/**
 * Get star statistics for snippet
 */
export const getStarStats = catchAsync(async (req: Request, res: Response) => {
  const { id: snippetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(snippetId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    // Verify snippet exists
    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Get star statistics
    const [totalStars, recentStars, starTrend] = await Promise.all([
      Star.countDocuments({ snippetId }),
      Star.countDocuments({
        snippetId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      }),
      Star.aggregate([
        { $match: { snippetId: new mongoose.Types.ObjectId(snippetId) } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }, // Last 7 days
      ]),
    ]);

    const stats = {
      totalStars,
      recentStars,
      starTrend,
      isStarred: req.user ? await Star.isStarredBy(req.user.id, snippetId) : false,
    };

    res.status(HTTP_STATUS.OK).json({ stats });
  } catch (error) {
    logger.error('Failed to get star stats:', error);
    throw error;
  }
});