import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';
import { authBruteForceProtection } from '../middleware/advancedRateLimiting';
import { requireAuth } from '../middleware/auth';
import { verifyCsrfToken } from '../middleware/csrf';

const router = Router();

// Authentication routes with enhanced brute force protection
router.post('/register', verifyCsrfToken, authBruteForceProtection, validateRegistration, register);
router.post('/login', verifyCsrfToken, authBruteForceProtection, validateLogin, login);

// Protected auth routes
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, verifyCsrfToken, logout);

export default router;
