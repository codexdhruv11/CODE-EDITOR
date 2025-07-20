import { Router } from 'express';
import { Request, Response } from 'express';
import { syncUser } from '../controllers/userController';
import { webhookLimiter } from '../middleware/rateLimiting';
import { catchAsync } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const router = Router();

// Apply webhook rate limiting
router.use(webhookLimiter);

/**
 * Clerk webhook handler for user creation/updates
 * Replaces the /clerk-webhook from the original Convex implementation
 */
router.post('/clerk', catchAsync(async (req: Request, res: Response) => {
  try {
    // Verify webhook signature if secret is configured
    if (config.clerkWebhookSecret) {
      const signature = req.headers['svix-signature'] as string;
      const timestamp = req.headers['svix-timestamp'] as string;
      const body = JSON.stringify(req.body);

      // In a real implementation, you would verify the webhook signature
      // using Clerk's webhook verification library
      // For now, we'll log the webhook and process it
      logger.info('Clerk webhook received', {
        signature: signature ? 'present' : 'missing',
        timestamp,
        eventType: req.body.type,
      });
    }

    const { type, data } = req.body;

    // Handle user creation and update events
    if (type === 'user.created' || type === 'user.updated') {
      const userData = {
        clerkId: data.id,
        email: data.email_addresses?.[0]?.email_address,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Unknown User',
      };

      if (!userData.email) {
        logger.warn('Clerk webhook: No email found for user', { clerkId: userData.clerkId });
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: {
            message: 'User email is required',
            code: ERROR_CODES.VALIDATION_ERROR,
          },
        });
      }

      // Use the existing syncUser function
      req.body = userData;
      await syncUser(req, res);
      return;
    }

    // Handle user deletion (optional)
    if (type === 'user.deleted') {
      logger.info('User deletion webhook received', { clerkId: data.id });
      // In a real implementation, you might want to handle user deletion
      // For now, we'll just acknowledge the webhook
      return res.status(HTTP_STATUS.OK).json({
        message: 'User deletion acknowledged',
      });
    }

    // Acknowledge other webhook types
    logger.info('Unhandled Clerk webhook type', { type });
    res.status(HTTP_STATUS.OK).json({
      message: 'Webhook received',
      type,
    });
  } catch (error) {
    logger.error('Clerk webhook processing failed:', error);
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Webhook processing failed',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
  }
}));

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