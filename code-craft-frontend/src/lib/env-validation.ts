/**
 * Frontend environment validation
 * Validates environment variables on the client side
 */

interface EnvConfig {
  apiUrl: string;
}

const validateEnvironment = (): EnvConfig => {
  // Get API URL from environment or use default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Validate API URL format
  try {
    new URL(apiUrl);
  } catch (error) {
    throw new Error(`Invalid NEXT_PUBLIC_API_URL format: ${apiUrl}`);
  }

  return {
    apiUrl,
  };
};

// Export validated environment configuration
export const env = validateEnvironment();