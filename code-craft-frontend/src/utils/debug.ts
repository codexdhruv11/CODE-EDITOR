// Debug utilities for development
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const debugError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[DEBUG ERROR] ${message}`, error);
  }
};