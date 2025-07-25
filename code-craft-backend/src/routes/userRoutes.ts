import { Router } from 'express';
import {
  getCurrentUser,
  updateUser,
  getUserStats,
  getUserProfile,
  changePassword,
} from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validateUserUpdate, validateObjectId, validatePasswordChange } from '../middleware/validation';
import { generalLimiter } from '../middleware/rateLimiting';
import { verifyCsrfToken } from '../middleware/csrf';

const router = Router();

// Apply general rate limiting to all user routes
router.use(generalLimiter);


// Get current user profile (requires authentication)
router.get('/me', requireAuth, getCurrentUser);

// Update user profile (requires authentication)
router.patch('/me', requireAuth, verifyCsrfToken, validateUserUpdate, updateUser);

// Change password (requires authentication)
router.post('/me/change-password', requireAuth, verifyCsrfToken, validatePasswordChange, changePassword);

// Get user statistics (public)
router.get('/:id/stats', validateObjectId('id'), getUserStats);

// Get user public profile (public)
router.get('/:id/profile', validateObjectId('id'), getUserProfile);

export default router;