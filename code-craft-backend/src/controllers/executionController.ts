import { Request, Response } from 'express';
import { CodeExecution } from '../models';
import { codeExecutionService } from '../services/codeExecution';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { parsePaginationParams, buildPaginationResponse } from '../utils/pagination';
import { logger } from '../utils/logger';

/**
 * Code execution controller
 * CRITICAL: Removes all language restrictions - ALL languages available to ALL authenticated users
 */

/**
 * Execute code and save result
 * CRITICAL: No premium checks - all languages available to all authenticated users
 */
export const executeCode = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

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
      userId: req.user.id,
      language,
      codeLength: code.length,
    });

    // Execute code using Piston API
    const executionResult = await codeExecutionService.executeCode(language, code);

    // Save execution result to database
    const codeExecution = new CodeExecution({
      userId: req.user.id,
      language,
      code,
      output: executionResult.output,
      error: executionResult.error,
      executionTime: executionResult.executionTime,
    });

    await codeExecution.save();

    logger.info(`Code execution completed and saved`, {
      userId: req.user.id,
      language,
      success: executionResult.success,
      executionTime: executionResult.executionTime,
      executionId: codeExecution._id,
    });

    // Return execution result
    res.status(HTTP_STATUS.OK).json({
      execution: {
        id: codeExecution._id,
        success: executionResult.success,
        output: executionResult.output,
        error: executionResult.error,
        executionTime: executionResult.executionTime,
        language,
        createdAt: codeExecution.createdAt,
      },
    });
  } catch (error) {
    logger.error('Code execution failed:', {
      userId: req.user.id,
      language,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Save failed execution to database for debugging
    try {
      const failedExecution = new CodeExecution({
        userId: req.user.id,
        language,
        code,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: 0,
      });
      await failedExecution.save();
    } catch (saveError) {
      logger.error('Failed to save failed execution:', saveError);
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Code execution failed',
        code: ERROR_CODES.EXTERNAL_API_ERROR,
        details: {
          language,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    });
  }
});

/**
 * Get user's execution history with pagination
 */
export const getUserExecutions = catchAsync(async (req: Request, res: Response) => {
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
  const query: any = { userId: req.user.id };
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

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Failed to get user executions:', error);
    throw error;
  }
});

/**
 * Get list of supported languages
 * CRITICAL: All languages are available to all users (no premium restrictions)
 */
export const getSupportedLanguages = catchAsync(async (req: Request, res: Response) => {
  const languages = codeExecutionService.getSupportedLanguages();

  res.status(HTTP_STATUS.OK).json({
    languages,
    message: 'All languages are available to all authenticated users',
  });
});

/**
 * Get execution statistics for current user
 */
export const getExecutionStats = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  try {
    const stats = await CodeExecution.getUserStats(req.user.id);

    // Get language breakdown
    const languageBreakdown = await CodeExecution.aggregate([
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
    ]);

    res.status(HTTP_STATUS.OK).json({
      stats: {
        ...stats,
        languageBreakdown,
      },
    });
  } catch (error) {
    logger.error('Failed to get execution stats:', error);
    throw error;
  }
});

/**
 * Get a specific execution by ID
 */
export const getExecutionById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id } = req.params;

  const execution = await CodeExecution.findOne({
    _id: id,
    userId: req.user.id, // Ensure user can only access their own executions
  });

  if (!execution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        message: 'Execution not found',
        code: ERROR_CODES.NOT_FOUND,
      },
    });
  }

  res.status(HTTP_STATUS.OK).json({ execution });
});