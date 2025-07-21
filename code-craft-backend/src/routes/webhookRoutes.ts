import { Router } from 'express';
import { Request, Response } from 'express';
import { webhookLimiter } from '../middleware/rateLimiting';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';

const router = Router();

// Apply webhook rate limiting
router.use(webhookLimiter);


/**
 * Health check for webhook endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    message: 'Webhook service is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;