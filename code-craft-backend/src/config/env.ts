import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  redisUrl?: string;
  logLevel: string;
  logFile: string;
  cookieDomain?: string;
  secureCookies: boolean;
}

interface RequiredEnvVar {
  key: string;
  description: string;
}

const validateRequiredEnvVars = (): void => {
  const required: RequiredEnvVar[] = [
    { key: 'MONGODB_URI', description: 'MongoDB connection string' },
    { key: 'JWT_SECRET', description: 'JWT secret key for token signing' }
  ];
  
  const missing = required.filter(({ key }) => !process.env[key]);
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing
      .map(({ key, description }) => `  - ${key}: ${description}`)
      .join('\n')}`;
    throw new Error(errorMessage);
  }

  // Validate JWT_SECRET length for security
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
};

// Validate environment variables on startup
try {
  validateRequiredEnvVars();
  console.log('Environment variables validated successfully');
} catch (error) {
  console.error('Environment validation failed:', (error as Error).message);
  process.exit(1);
}

export const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  redisUrl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/app.log',
  cookieDomain: process.env.COOKIE_DOMAIN,
  secureCookies: process.env.NODE_ENV === 'production'
};

export default config;