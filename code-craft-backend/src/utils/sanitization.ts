import { Types } from 'mongoose';

/**
 * Utility functions for input sanitization to prevent NoSQL injection attacks
 */

/**
 * Escapes special regex characters to prevent regex injection
 * @param input - The input string to escape
 * @returns Escaped string safe for regex use
 */
export const escapeRegexSpecialChars = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  // Escape all regex special characters
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitizes MongoDB query operators to prevent NoSQL injection
 * @param obj - The object to sanitize
 * @returns Sanitized object with MongoDB operators removed
 */
export const sanitizeMongoQuery = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoQuery);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys that start with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }
    sanitized[key] = sanitizeMongoQuery(value);
  }

  return sanitized;
};

/**
 * Validates and sanitizes MongoDB ObjectId
 * @param id - The ID to validate
 * @returns Valid ObjectId string or null if invalid
 */
export const validateObjectId = (id: string): string | null => {
  if (!id || typeof id !== 'string') {
    return null;
  }

  // Check if it's a valid ObjectId format
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return id;
};

/**
 * Sanitizes search input for safe database queries
 * @param searchTerm - The search term to sanitize
 * @returns Sanitized search term
 */
export const sanitizeSearchInput = (searchTerm: string): string => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return '';
  }

  // Trim whitespace and limit length
  const trimmed = searchTerm.trim().substring(0, 100);
  
  // Escape regex special characters
  return escapeRegexSpecialChars(trimmed);
};

/**
 * Validates and sanitizes pagination parameters
 * @param page - Page number
 * @param limit - Items per page
 * @returns Sanitized pagination object
 */
export const sanitizePagination = (page?: string | number, limit?: string | number) => {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || 20), 10) || 20));
  
  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };
};