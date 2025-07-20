import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SnippetComment, Snippet } from '../models';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { parsePaginationParams } from '../utils/pagination';
import { logger } from '../utils/logger';

/**
 * Comment controller handling snippet comments
 */

/**
 * Add comment to snippet
 */
export const addComment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id: snippetId } = req.params;
  const { content } = req.body;

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

    // Create comment
    const comment = new SnippetComment({
      snippetId,
      userId: req.user.id,
      userName: req.user.name,
      content: content.trim(),
    });

    await comment.save();

    logger.info(`Comment added to snippet`, {
      commentId: comment._id,
      snippetId,
      userId: req.user.id,
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Comment added successfully',
      comment: comment.toJSON(),
    });
  } catch (error) {
    logger.error('Failed to add comment:', error);
    throw error;
  }
});

/**
 * Get comments for snippet with pagination
 */
export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { id: snippetId } = req.params;
  const { page, limit } = parsePaginationParams(req);

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

    // Get comments with pagination
    const result = await SnippetComment.getBySnippetId(snippetId, page, limit);

    res.status(HTTP_STATUS.OK).json({
      data: result.comments,
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
    logger.error('Failed to get comments:', error);
    throw error;
  }
});

/**
 * Update comment (owner only)
 */
export const updateComment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid comment ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    const comment = await SnippetComment.findById(id);

    if (!comment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Comment not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Check ownership
    if (!comment.isOwnedBy(req.user.id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          message: 'You can only update your own comments',
          code: ERROR_CODES.FORBIDDEN,
        },
      });
    }

    // Update comment
    comment.content = content.trim();
    await comment.save();

    logger.info(`Comment updated`, {
      commentId: comment._id,
      userId: req.user.id,
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Comment updated successfully',
      comment: comment.toJSON(),
    });
  } catch (error) {
    logger.error('Failed to update comment:', error);
    throw error;
  }
});

/**
 * Delete comment (owner only)
 */
export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid comment ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    const comment = await SnippetComment.findById(id);

    if (!comment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Comment not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    // Check ownership
    if (!comment.isOwnedBy(req.user.id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          message: 'You can only delete your own comments',
          code: ERROR_CODES.FORBIDDEN,
        },
      });
    }

    await SnippetComment.findByIdAndDelete(id);

    logger.info(`Comment deleted`, {
      commentId: id,
      userId: req.user.id,
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete comment:', error);
    throw error;
  }
});

/**
 * Get comment by ID
 */
export const getCommentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Invalid comment ID',
        code: ERROR_CODES.INVALID_INPUT,
      },
    });
  }

  try {
    const comment = await SnippetComment.findById(id).populate('userId', 'name email');

    if (!comment) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          message: 'Comment not found',
          code: ERROR_CODES.NOT_FOUND,
        },
      });
    }

    res.status(HTTP_STATUS.OK).json({ comment });
  } catch (error) {
    logger.error('Failed to get comment:', error);
    throw error;
  }
});

/**
 * Get user's comments with pagination
 */
export const getUserComments = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        message: 'User not authenticated',
        code: ERROR_CODES.UNAUTHORIZED,
      },
    });
  }

  const { page, limit, skip } = parsePaginationParams(req);

  try {
    const [comments, total] = await Promise.all([
      SnippetComment.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('snippetId', 'title language userName'),
      SnippetComment.countDocuments({ userId: req.user.id }),
    ]);

    res.status(HTTP_STATUS.OK).json({
      data: comments,
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
    logger.error('Failed to get user comments:', error);
    throw error;
  }
});