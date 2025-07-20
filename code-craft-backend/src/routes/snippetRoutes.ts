import { Router } from 'express';
import {
  createSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  getStarredSnippets,
  getSnippetsByUser,
} from '../controllers/snippetController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import {
  validateSnippetCreation,
  validateSnippetUpdate,
  validateObjectId,
  validatePagination,
  validateSearch,
} from '../middleware/validation';
import { snippetCreationLimiter, generalLimiter } from '../middleware/rateLimiting';

const router = Router();

// Apply general rate limiting to all snippet routes
router.use(generalLimiter);

// Create snippet (requires auth, rate limited)
router.post(
  '/',
  requireAuth,
  snippetCreationLimiter,
  validateSnippetCreation,
  createSnippet
);

// Get all snippets (public, paginated)
router.get(
  '/',
  optionalAuth,
  validatePagination,
  validateSearch,
  getSnippets
);

// Get user's starred snippets (requires auth)
router.get(
  '/starred',
  requireAuth,
  validatePagination,
  getStarredSnippets
);

// Get snippets by user (public)
router.get(
  '/user/:userId',
  optionalAuth,
  validatePagination,
  getSnippetsByUser
);

// Get specific snippet (public)
router.get(
  '/:id',
  optionalAuth,
  validateObjectId('id'),
  getSnippetById
);

// Update snippet (requires auth, owner only)
router.put(
  '/:id',
  requireAuth,
  validateObjectId('id'),
  validateSnippetUpdate,
  updateSnippet
);

// Delete snippet (requires auth, owner only)
router.delete(
  '/:id',
  requireAuth,
  validateObjectId('id'),
  deleteSnippet
);

export default router;