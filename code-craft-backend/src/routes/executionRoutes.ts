import { Router } from 'express';
import {
  executeCode,
  getUserExecutions,
  getSupportedLanguages,
  getExecutionStats,
  getExecutionById,
} from '../controllers/executionController';
import { requireAuth } from '../middleware/auth';
import {
  validateCodeExecution,
  validateObjectId,
  validatePagination,
} from '../middleware/validation';
import { codeExecutionLimiter, generalLimiter } from '../middleware/rateLimiting';

const router = Router();

// Apply general rate limiting to all execution routes
router.use(generalLimiter);

// Execute code (requires auth, heavily rate limited)
// CRITICAL: All languages available to all authenticated users
router.post(
  '/',
  requireAuth,
  codeExecutionLimiter,
  validateCodeExecution,
  executeCode
);

// Get user execution history (requires auth, paginated)
router.get(
  '/',
  requireAuth,
  validatePagination,
  getUserExecutions
);

// Get execution statistics for current user (requires auth)
router.get(
  '/stats',
  requireAuth,
  getExecutionStats
);

// Get specific execution by ID (requires auth, owner only)
router.get(
  '/:id',
  requireAuth,
  validateObjectId('id'),
  getExecutionById
);

// Get supported languages (public)
// CRITICAL: All languages shown as available to all users
router.get(
  '/languages',
  getSupportedLanguages
);

export default router;