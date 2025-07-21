import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { authBruteForceProtection } from '../middleware/advancedRateLimiting';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Authentication routes with enhanced brute force protection
router.post('/register', authBruteForceProtection, validateRegistration, register);
router.post('/login', authBruteForceProtection, validateLogin, login);

// Protected auth routes
router.get('/me', requireAuth, getMe);

export default router;