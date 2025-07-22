/**
 * User model
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Snippet model
 */
export interface Snippet {
  _id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  author: {
    _id: string;
    name: string;
  };
  stars: number;
  comments: number;
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment model
 */
export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  snippet: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Star model
 */
export interface Star {
  _id: string;
  user: string;
  snippet: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Code execution model
 */
export interface CodeExecution {
  _id: string;
  code: string;
  language: string;
  status: 'success' | 'error';
  output: string;
  error?: string;
  executionTime: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Execution statistics
 */
export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  mostUsedLanguage: string;
} 