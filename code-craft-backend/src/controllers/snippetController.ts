import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Snippet, SnippetComment, Star, User } from '../models';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { parsePaginationParams, buildPaginationResponse } from '../utils/pagination';
import { logger } from '../utils/logger';
import { ISnippet } from '../models/Snippet';
import { sanitizeSearchInput, validateObjectId, sanitizePagination, sanitizeRequestBody, sanitizeMongoQuery } from '../utils/sanitization';

/**
 * Snippet controller handling all snippet-related operations
 * Converts Convex functions to REST endpoints with no premium restrictions
 */

/**
 * Create new code snippet
 */
export const createSnippet = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  // Sanitize request body to prevent NoSQL injection
  const sanitizedBody = sanitizeRequestBody(req.body);
  const { title, description, language, code } = sanitizedBody;

  logger.info('Creating snippet', { 
    userId: req.user.id, 
    title: title?.substring(0, 50), 
    language 
  });

  try {
    const snippet = new Snippet({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      programmingLanguage: language,
      code,
      userName: req.user.name,
    });
    
    await snippet.save();

    logger.info(`Snippet created`, {
      snippetId: snippet._id,
      userId: req.user.id,
      language,
      title,
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Snippet created successfully',
      snippet: snippet.toJSON(),
    });
  } catch (error) {
    logger.error('Failed to create snippet:', error);
    throw error;
  }
});

/**
 * Get all snippets with pagination and optional filtering
 */
export const getSnippets = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req);
  // Sanitize query parameters to prevent NoSQL injection
  const sanitizedQuery = sanitizeMongoQuery(req.query);
  const { language, search, userId } = sanitizedQuery;

  // Build query
  interface SnippetQuery {
    programmingLanguage?: string;
    userId?: string;
    title?: { $regex: string; $options: string };
    $text?: { $search: string };
  }
  
  const query: SnippetQuery = {};

  if (language && typeof language === 'string') {
    query.programmingLanguage = language;
  }

  if (search && typeof search === 'string') {
    const sanitizedSearch = sanitizeSearchInput(search);
    if (sanitizedSearch) {
      query.title = { $regex: sanitizedSearch, $options: 'i' };
    }
  }

  if (userId && typeof userId === 'string') {
    const validUserId = validateObjectId(userId);
    if (validUserId) {
      query.userId = validUserId;
    }
  }

  try {
    // Get snippets with pagination using lean() for better performance
    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .populate('starCount')
        .populate('commentCount'),
      Snippet.countDocuments(query),
    ]);

    const response = buildPaginationResponse(snippets, total, page, limit);

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Failed to get snippets:', error);
    throw error;
  }
});

/**
 * Get specific snippet by ID
 */
export const getSnippetById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
    return;
  }

  try {
    const snippet = await Snippet.findById(id)
      .populate('starCount')
      .populate('commentCount');

    if (!snippet) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
      return;
    }

    // Check if current user has starred this snippet
    let isStarred = false;
    if (req.user) {
      const snippetDoc = snippet as ISnippet & { _id: mongoose.Types.ObjectId };
      isStarred = await Star.isStarredBy(req.user.id, snippetDoc._id.toString());
    }

    res.status(HTTP_STATUS.OK).json({
      snippet: {
        ...snippet.toJSON(),
        isStarred,
      },
    });
  } catch (error) {
    logger.error('Failed to get snippet:', error);
    throw error;
  }
});

/**
 * Update snippet (owner only)
 */
export const updateSnippet = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  const { id } = req.params;
  // Sanitize request body to prevent NoSQL injection
  const sanitizedBody = sanitizeRequestBody(req.body);
  const { title, description, language, code } = sanitizedBody;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
    return;
  }

  try {
    const snippet = await Snippet.findById(id);

    if (!snippet) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
      return;
    }

    // Check ownership
    if (!snippet.isOwnedBy(req.user.id)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          message: 'You can only update your own snippets',
          code: ERROR_CODES.FORBIDDEN,
        },
      });
      return;
    }

    // Update fields if provided
    if (title !== undefined) {
      snippet.title = title.trim();
    }
    if (description !== undefined) {
      snippet.description = description ? description.trim() : undefined;
    }
    if (language !== undefined) {
      snippet.programmingLanguage = language;
    }
    if (code !== undefined) {
      snippet.code = code;
    }

    await snippet.save();

    logger.info(`Snippet updated`, {
      snippetId: snippet._id,
      userId: req.user.id,
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Snippet updated successfully',
      snippet: snippet.toJSON(),
    });
  } catch (error) {
    logger.error('Failed to update snippet:', error);
    throw error;
  }
});

/**
 * Delete snippet with cascade delete of comments and stars
 */
export const deleteSnippet = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid snippet ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
    return;
  }

  try {
    const snippet = await Snippet.findById(id);

    if (!snippet) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Snippet not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
      return;
    }

    // Check ownership
    if (!snippet.isOwnedBy(req.user.id)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          message: 'You can only delete your own snippets',
          code: ERROR_CODES.FORBIDDEN,
        },
      });
      return;
    }

    // Use transaction for cascade deletion
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete associated comments
        await SnippetComment.deleteMany({ snippetId: id }).session(session);
        
        // Delete associated stars
        await Star.deleteMany({ snippetId: id }).session(session);
        
        // Delete the snippet
        await Snippet.findByIdAndDelete(id).session(session);
      });

      logger.info(`Snippet deleted with cascade`, {
        snippetId: id,
        userId: req.user.id,
      });

      res.status(HTTP_STATUS.OK).json({
        message: 'Snippet deleted successfully',
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    logger.error('Failed to delete snippet:', error);
    throw error;
  }
});

/**
 * Get user's starred snippets
 */
export const getStarredSnippets = catchAsync(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
    return;
  }

  const { page, limit } = parsePaginationParams(req);

  try {
    const result = await Star.getUserStarredSnippets(req.user.id, page, limit);

    res.status(HTTP_STATUS.OK).json({
      data: result.snippets,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    });
  } catch (error) {
    logger.error('Failed to get starred snippets:', error);
    throw error;
  }
});

/**
 * Get snippets by user ID (public)
 */
export const getSnippetsByUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { page, limit, skip } = parsePaginationParams(req);

  // Validate user exists
  let user;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId);
  } else {
    user = null;
  }

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
    const [snippets, total] = await Promise.all([
      Snippet.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('starCount')
        .populate('commentCount'),
      Snippet.countDocuments({ userId: user._id }),
    ]);

    const response = buildPaginationResponse(snippets, total, page, limit);

    res.status(HTTP_STATUS.OK).json({
      ...response,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    logger.error('Failed to get user snippets:', error);
    throw error;
  }
});