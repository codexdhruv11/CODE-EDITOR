import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Check if this is a production environment or MongoDB Atlas connection
    const isProduction = process.env.NODE_ENV === 'production';
    const isAtlasConnection = mongoUri.includes('mongodb+srv://') || mongoUri.includes('.mongodb.net');
    
    const options = {
      // Optimized connection pooling
      maxPoolSize: 20, // Increase pool size for better performance
      minPoolSize: 5, // Maintain minimum connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
      w: 'majority' as const,
      // Connection monitoring
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      // Read preferences for better performance
      readPreference: 'primaryPreferred' as const,
      // Buffer settings
      bufferCommands: false,
      // TLS/SSL Configuration for security
      tls: isProduction || isAtlasConnection, // Enable TLS in production or for Atlas
      tlsAllowInvalidCertificates: false, // Never allow invalid certificates
      tlsAllowInvalidHostnames: false, // Enforce hostname verification
      // Additional security options
      authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
      // Enable compression for better network efficiency
      compressors: ['snappy', 'zlib'],
    };
    
    // Log security status
    if (options.tls) {
      logger.info('MongoDB TLS/SSL encryption enabled');
    } else {
      logger.warn('MongoDB TLS/SSL encryption disabled - only use for local development');
    }

    await mongoose.connect(mongoUri, options);
    
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});