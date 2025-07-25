import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { getSupportedLanguageIds, API_CONSTANTS, HTTP_STATUS, ERROR_CODES } from '../utils/constants';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Setup DOMPurify for server-side HTML sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: 'Validation failed',
        code: ERROR_CODES.VALIDATION_ERROR,
        details: errors.array(),
      },
    });
    return;
  }
  
  next();
};

// Authentication validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",./<>?])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
    .custom((value) => {
      // Additional password complexity checks
      // Check for sequential characters (e.g., 123, abc)
      const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(value);
      if (hasSequential) {
        throw new Error('Password must not contain sequential characters');
      }
      
      // Check for repeated characters (e.g., aaa, 111)
      const hasRepeated = /(.)\1{2,}/.test(value);
      if (hasRepeated) {
        throw new Error('Password must not contain 3 or more repeated characters');
      }
      
      // Check for common passwords patterns
      const commonPatterns = ['password', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey', 'dragon'];
      const lowerValue = value.toLowerCase();
      if (commonPatterns.some(pattern => lowerValue.includes(pattern))) {
        throw new Error('Password is too common or predictable');
      }
      
      return true;
    }),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// User validation
// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 12 })
    .withMessage('New password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",./<>?])/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
    .custom((value, { req }) => {
      // Ensure new password is different from current password
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      
      // Apply same complexity checks as registration
      const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(value);
      if (hasSequential) {
        throw new Error('Password must not contain sequential characters');
      }
      
      const hasRepeated = /(.)\1{2,}/.test(value);
      if (hasRepeated) {
        throw new Error('Password must not contain 3 or more repeated characters');
      }
      
      const commonPatterns = ['password', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey', 'dragon'];
      const lowerValue = value.toLowerCase();
      if (commonPatterns.some(pattern => lowerValue.includes(pattern))) {
        throw new Error('Password is too common or predictable');
      }
      
      return true;
    }),
  handleValidationErrors,
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .customSanitizer((value) => {
      // Sanitize HTML content to prevent XSS
      return purify.sanitize(value || '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    }),
  handleValidationErrors,
];

// Snippet validation
export const validateSnippetCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: API_CONSTANTS.MAX_TITLE_LENGTH })
    .withMessage(`Title must be between 1 and ${API_CONSTANTS.MAX_TITLE_LENGTH} characters`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .customSanitizer((value) => {
      // Sanitize HTML content to prevent XSS
      return purify.sanitize(value || '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    }),
  body('language')
    .isIn(getSupportedLanguageIds())
    .withMessage(`Language must be one of: ${getSupportedLanguageIds().join(', ')}`),
  body('code')
    .isLength({ min: 1, max: API_CONSTANTS.MAX_CODE_LENGTH })
    .withMessage(`Code must be between 1 and ${API_CONSTANTS.MAX_CODE_LENGTH} characters`),
  handleValidationErrors,
];

export const validateSnippetUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: API_CONSTANTS.MAX_TITLE_LENGTH })
    .withMessage(`Title must be between 1 and ${API_CONSTANTS.MAX_TITLE_LENGTH} characters`),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .customSanitizer((value) => {
      // Sanitize HTML content to prevent XSS
      return purify.sanitize(value || '', {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
    }),
  body('language')
    .optional()
    .isIn(getSupportedLanguageIds())
    .withMessage(`Language must be one of: ${getSupportedLanguageIds().join(', ')}`),
  body('code')
    .optional()
    .isLength({ min: 1, max: API_CONSTANTS.MAX_CODE_LENGTH })
    .withMessage(`Code must be between 1 and ${API_CONSTANTS.MAX_CODE_LENGTH} characters`),
  handleValidationErrors,
];

// Comment validation
export const validateCommentCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: API_CONSTANTS.MAX_COMMENT_LENGTH })
    .withMessage(`Comment must be between 1 and ${API_CONSTANTS.MAX_COMMENT_LENGTH} characters`)
    .customSanitizer((value) => {
      // Sanitize HTML content to prevent XSS
      return purify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
        ALLOWED_ATTR: [],
      });
    }),
  handleValidationErrors,
];

export const validateCommentUpdate = [
  body('content')
    .trim()
    .isLength({ min: 1, max: API_CONSTANTS.MAX_COMMENT_LENGTH })
    .withMessage(`Comment must be between 1 and ${API_CONSTANTS.MAX_COMMENT_LENGTH} characters`)
    .customSanitizer((value) => {
      return purify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'],
        ALLOWED_ATTR: [],
      });
    }),
  handleValidationErrors,
];

// Code execution validation
export const validateCodeExecution = [
  body('language')
    .isIn(getSupportedLanguageIds())
    .withMessage(`Language must be one of: ${getSupportedLanguageIds().join(', ')}`),
  body('code')
    .isLength({ min: 1, max: API_CONSTANTS.MAX_CODE_LENGTH })
    .withMessage(`Code must be between 1 and ${API_CONSTANTS.MAX_CODE_LENGTH} characters`),
  handleValidationErrors,
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: API_CONSTANTS.MAX_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${API_CONSTANTS.MAX_PAGE_SIZE}`)
    .toInt(),
  handleValidationErrors,
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName: string) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
  handleValidationErrors,
];

// Search validation
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .custom((value) => {
      // Allow empty string or values between 1-100 characters
      if (value === '' || value === undefined) return true;
      return value.length >= 1 && value.length <= 100;
    })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('language')
    .optional()
    .custom((value) => {
      // Allow empty string for "all languages"
      if (value === '' || value === undefined) return true;
      return getSupportedLanguageIds().includes(value);
    })
    .withMessage(`Language filter must be empty or one of: ${getSupportedLanguageIds().join(', ')}`),
  handleValidationErrors,
];

// Language validation helper
export const validateLanguage = (req: Request, res: Response, next: NextFunction): void => {
  const { language } = req.body;
  
  if (!getSupportedLanguageIds().includes(language)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        message: `Unsupported language: ${language}`,
        code: ERROR_CODES.INVALID_LANGUAGE,
        details: {
          supportedLanguages: getSupportedLanguageIds(),
        },
      },
    });
    return;
  }
  
  next();
};