import { Router } from 'express';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getCommentById,
  getUserComments,
} from '../controllers/commentController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  validateCommentCreation,
  validateCommentUpdate,
  validateObjectId,
  validatePagination,
} from '../middleware/validation';
import { commentLimiter, generalLimiter } from '../middleware/rateLimiting';
import { verifyCsrfToken } from '../middleware/csrf';

const router = Router();

// Apply general rate limiting to all comment routes
router.use(generalLimiter);

// Add comment to snippet (requires auth, rate limited)
router.post(
  '/snippets/:id/comments',
  requireAuth,
  verifyCsrfToken,
  commentLimiter,
  validateObjectId('id'),
  validateCommentCreation,
  addComment
);

// Get snippet comments (public, paginated)
router.get(
  '/snippets/:id/comments',
  optionalAuth,
  validateObjectId('id'),
  validatePagination,
  getComments
);

// Get user's comments (requires auth)
router.get(
  '/my-comments',
  requireAuth,
  validatePagination,
  getUserComments
);

// Get comment by ID (public)
router.get(
  '/:id',
  optionalAuth,
  validateObjectId('id'),
  getCommentById
);

// Update comment (requires auth, owner only)
router.put(
  '/:id',
  requireAuth,
  verifyCsrfToken,
  validateObjectId('id'),
  validateCommentUpdate,
  updateComment
);

// Delete comment (requires auth, owner only)
router.delete(
  '/:id',
  requireAuth,
  verifyCsrfToken,
  validateObjectId('id'),
  deleteComment
);

export default router;