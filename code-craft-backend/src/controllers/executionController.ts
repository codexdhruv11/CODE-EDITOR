import { Request, Response, NextFunction } from 'express';
import { CodeExecution } from '../models';
import { codeExecutionService } from '../services/codeExecution';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { parsePaginationParams, buildPaginationResponse } from '../utils/pagination';
import { logger } from '../utils/logger';
import { validateObjectId, sanitizePagination } from '../utils/sanitization';

/**
 * Code execution controller
 * CRITICAL: Removes all language restrictions - ALL languages available to ALL authenticated users
 */

/**
 * Execute code and save result
 * UPDATED: Allow guest execution with stricter rate limiting
 */
export const executeCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const isGuest = !req.user;
  const userId = req.user?.id || `guest-${req.ip}`;
  const userIdentifier = req.user ? `user-${req.user.id}` : `guest-${req.ip}`;
  
  logger.info(`Code execution request`, {
    userType: isGuest ? 'guest' : 'authenticated',
    userId: userIdentifier,
  });

  const { language, code } = req.body;

  // Validate language is supported
  if (!codeExecutionService.validateLanguage(language)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: `Unsupported language: ${language}`,
        code: ERROR_CODES.INVALID_LANGUAGE,
        details: {
          supportedLanguages: codeExecutionService.getSupportedLanguages(),
        },
      },
    });
  }

  try {
    logger.info(`Code execution started`, {
      userId: userIdentifier,
      language,
      codeLength: code.length,
      isGuest,
    });

    // Execute code using Piston API
    const executionResult = await codeExecutionService.executeCode(language, code);

    // Only save execution result to database for authenticated users
    let executionId = null;
    if (!isGuest) {
      const codeExecution = new CodeExecution({
        userId: req.user!.id,
        language,
        code,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: executionResult.executionTime,
      });

      await codeExecution.save();
      executionId = codeExecution._id;
    }

    logger.info(`Code execution completed`, {
      userId: userIdentifier,
      language,
      success: executionResult.success,
      executionTime: executionResult.executionTime,
      executionId,
      isGuest,
    });

    // Return execution result
    return res.status(HTTP_STATUS.OK).json({
      execution: {
        id: executionId,
        success: executionResult.success,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: executionResult.executionTime,
        language,
        createdAt: new Date(),
        isGuest,
      },
    });
  } catch (error) {
    logger.error('Code execution failed:', {
      userId: userIdentifier,
      language,
      error: error instanceof Error ? error.message : 'Unknown error',
      isGuest,
    });

    // Save failed execution to database for debugging (authenticated users only)
    if (!isGuest) {
      try {
        const failedExecution = new CodeExecution({
          userId: req.user!.id,
          language,
          code,
          error: error instanceof Error ? error.message : 'Unknown execution error',
          executionTime: 0,
        });
        await failedExecution.save();
      } catch (saveError) {
        logger.error('Failed to save failed execution:', saveError);
      }
    }

    return next(error);
  }
});

/**
 * Get user's execution history with pagination
 */
export const getUserExecutions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { page, limit, skip } = parsePaginationParams(req);
  const { language } = req.query;

  // Build query
  interface ExecutionQuery {
    userId: string;
    language?: string;
  }
  
  const query: ExecutionQuery = { userId: req.user.id };
  if (language && typeof language === 'string') {
    if (!codeExecutionService.validateLanguage(language)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          message: `Invalid language filter: ${language}`,
          code: ERROR_CODES.INVALID_LANGUAGE,
        },
      });
    }
    query.language = language;
  }

  try {
    // Get executions with pagination
    const [executions, total] = await Promise.all([
      CodeExecution.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('language code output error executionTime createdAt'),
      CodeExecution.countDocuments(query),
    ]);

    const response = buildPaginationResponse(executions, total, page, limit);

    return res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Failed to get user executions:', error);
    return next(error);
  }
});

/**
 * Get list of supported languages
 * CRITICAL: All languages are available to all users (no premium restrictions)
 */
export const getSupportedLanguages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const languages = codeExecutionService.getSupportedLanguages();

  return res.status(HTTP_STATUS.OK).json({
    languages,
    message: 'All languages are available to all authenticated users',
  });
});

/**
 * Get execution statistics for current user
 */
export const getExecutionStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  try {
    // Use aggregation pipeline for better performance
    const [generalStats, languageBreakdown] = await Promise.all([
      CodeExecution.aggregate([
        { $match: { userId: req.user.id } },
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
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: '$language',
            count: { $sum: 1 },
            avgExecutionTime: { $avg: '$executionTime' },
            lastUsed: { $max: '$createdAt' },
          },
        },
        { $sort: { count: -1 } },
      ])
    ]);

    const stats = generalStats[0] || {
      totalExecutions: 0,
      avgExecutionTime: 0,
      languagesUsed: [],
      last24Hours: 0
    };

    return res.status(HTTP_STATUS.OK).json({
      stats: {
        totalExecutions: stats.totalExecutions,
        avgExecutionTime: Math.round(stats.avgExecutionTime || 0),
        languagesUsed: stats.languagesUsed?.length || 0,
        last24Hours: stats.last24Hours,
        languageBreakdown,
      },
    });
  } catch (error) {
    logger.error('Failed to get execution stats:', error);
    return next(error);
  }
});

/**
 * Get a specific execution by ID
 */
export const getExecutionById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id } = req.params;

  // Validate execution ID
  const validExecutionId = validateObjectId(id);
  if (!validExecutionId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid execution ID format',
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
  }

  const execution = await CodeExecution.findOne({
    _id: validExecutionId,
    userId: req.user.id, // Ensure user can only access their own executions
  }).lean();

  if (!execution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'Execution not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  return res.status(HTTP_STATUS.OK).json({ execution });
});