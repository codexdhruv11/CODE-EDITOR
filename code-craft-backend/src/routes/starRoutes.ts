import { Router } from 'express';
import {
  toggleStar,
  getStarCount,
  isStarredByUser,
  getSnippetStars,
  getStarStats,
} from '../controllers/starController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';
import { starLimiter, generalLimiter } from '../middleware/rateLimiting';

const router = Router();

// Apply general rate limiting to all star routes
router.use(generalLimiter);

// Toggle star on snippet (requires auth)
router.post(
  '/snippets/:id/stars',
  requireAuth,
  starLimiter,
  validateObjectId('id'),
  toggleStar
);

// Get star count (public)
router.get(
  '/snippets/:id/stars/count',
  validateObjectId('id'),
  getStarCount
);

// Check if user starred snippet (requires auth)
router.get(
  '/snippets/:id/stars/me',
  requireAuth,
  validateObjectId('id'),
  isStarredByUser
);

// Get users who starred snippet (public, optional)
router.get(
  '/snippets/:id/stars',
  optionalAuth,
  validateObjectId('id'),
  getSnippetStars
);

// Get star statistics for snippet (public)
router.get(
  '/snippets/:id/stars/stats',
  optionalAuth,
  validateObjectId('id'),
  getStarStats
);

export default router;