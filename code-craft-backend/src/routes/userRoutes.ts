import { Router } from 'express';
import {
  syncUser,
  getCurrentUser,
  updateUser,
  getUserStats,
  getUserProfile,
} from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validateUserUpdate, validateObjectId } from '../middleware/validation';
import { generalLimiter } from '../middleware/rateLimiting';

const router = Router();

// Apply general rate limiting to all user routes
router.use(generalLimiter);

// User sync route (for webhooks/internal use)
router.post('/sync', syncUser);

// Get current user profile (requires authentication)
router.get('/me', requireAuth, getCurrentUser);

// Update user profile (requires authentication)
router.patch('/me', requireAuth, validateUserUpdate, updateUser);

// Get user statistics (public)
router.get('/:id/stats', validateObjectId('id'), getUserStats);

// Get user public profile (public)
router.get('/:id/profile', validateObjectId('id'), getUserProfile);

export default router;