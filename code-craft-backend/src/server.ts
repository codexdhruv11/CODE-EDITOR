import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase, disconnectDatabase } from './config/database';
import { config } from './config/env';
import { logger, requestLogger } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiting';
import apiRoutes from './routes';

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigin.split(',').map((origin: string) => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Code-Craft Backend API',
    version: '1.0.0',
    description: 'MERN stack backend for Code-Craft - A free code editor and snippet sharing platform',
    documentation: '/api/docs',
    health: '/api/health',
    features: [
      'Code execution in 10+ programming languages (all free)',
      'Snippet sharing and management',
      'Comments and stars system',
      'User profiles and statistics',
      'No premium restrictions - everything is free for authenticated users',
    ],
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

// Server startup function
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Code-Craft Backend API started successfully!`);
      logger.info(`📍 Server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`🎯 Features: All languages free, no premium restrictions`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await disconnectDatabase();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle process signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  console.log('🚀 Starting Code-Craft Backend Server...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', process.env.PORT || '3001');
  startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

// Export app for testing
export default app;