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
  pistonApiUrl?: string;
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

  // Validate JWT_SECRET length for security (256-bit minimum)
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long (256 bits) for security');
  }
  
  // Additional validation for JWT secret complexity
  // Allow any printable ASCII characters for flexibility while maintaining security
  if (!/^[\x20-\x7E]{32,}$/.test(jwtSecret)) {
    throw new Error('JWT_SECRET must contain only printable ASCII characters and be at least 32 characters long');
  }
  
  // Warn if JWT secret is not optimal length (64 chars = 512 bits)
  if (jwtSecret.length < 64 && process.env.NODE_ENV === 'production') {
    console.warn('Warning: JWT_SECRET should be at least 64 characters for production environments');
  }
  
  // Validate PISTON_API_URL if provided (SSRF prevention)
  if (process.env.PISTON_API_URL) {
    try {
      const url = new URL(process.env.PISTON_API_URL);
      // Ensure it's HTTPS in production
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        throw new Error('PISTON_API_URL must use HTTPS in production');
      }
      // Validate against allowed domains (whitelist approach)
      const allowedDomains = ['emkc.org', 'localhost', '127.0.0.1'];
      if (!allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
        throw new Error(`PISTON_API_URL domain not in whitelist: ${url.hostname}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid PISTON_API_URL: ${error.message}`);
      }
      throw new Error('Invalid PISTON_API_URL format');
    }
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
  secureCookies: process.env.NODE_ENV === 'production',
  pistonApiUrl: process.env.PISTON_API_URL
};

export default config;