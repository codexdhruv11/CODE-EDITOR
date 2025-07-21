/**
 * API Constants
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    ME: '/users/me',
    UPDATE: '/users/me',
    CHANGE_PASSWORD: '/users/change-password',
  },
  SNIPPETS: {
    BASE: '/snippets',
    SINGLE: (id: string) => `/snippets/${id}`,
    STARRED: '/snippets/starred',
    DETAIL: (id: string) => `/snippets/${id}`,
  },
  COMMENTS: {
    LIST: (snippetId: string) => `/comments/snippets/${snippetId}/comments`,
    SINGLE: (commentId: string) => `/comments/${commentId}`,
    DETAIL: (id: string) => `/comments/${id}`,
  },
  STARS: {
    TOGGLE: (snippetId: string) => `/stars/snippets/${snippetId}/stars`,
  },
  EXECUTIONS: {
    BASE: '/executions',
    LANGUAGES: '/executions/languages',
    STATS: '/executions/stats',
  },
};

/**
 * Supported Programming Languages
 */
export const SUPPORTED_LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    icon: 'logos:javascript',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    icon: 'logos:typescript-icon',
  },
  {
    id: 'python',
    name: 'Python',
    extension: 'py',
    icon: 'logos:python',
  },
  {
    id: 'java',
    name: 'Java',
    extension: 'java',
    icon: 'logos:java',
  },
  {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    icon: 'logos:c-sharp',
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    icon: 'logos:c-plusplus',
  },
  {
    id: 'go',
    name: 'Go',
    extension: 'go',
    icon: 'logos:go',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: 'rb',
    icon: 'logos:ruby',
  },
  {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    icon: 'logos:php',
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: 'rs',
    icon: 'logos:rust',
  },
];

/**
 * API Limits
 */
export const API_LIMITS = {
  CODE_MAX_LENGTH: 50000,
  COMMENT_MAX_LENGTH: 1000,
  TITLE_MAX_LENGTH: 100,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  EXECUTION_TIMEOUT: 30000, // 30 seconds
  RATE_LIMIT: {
    EXECUTIONS: 10, // 10 per minute
  },
};

/**
 * Error Codes
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
};

/**
 * Responsive Breakpoints
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1280,
  DESKTOP: 1280,
};

/**
 * Animation Priorities
 */
export const ANIMATION_PRIORITIES = {
  P1: {
    BUTTON_EFFECTS: true,
    LOADING_STATES: true,
    SIDEBAR_TRANSITIONS: true,
  },
  P2: {
    TEXT_EFFECTS: true,
    PAGE_TRANSITIONS: true,
    HOVER_EFFECTS: true,
  },
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  THEME: 'theme',
  EDITOR_SETTINGS: 'editor-settings',
  CODE_DRAFTS: 'code-craft-drafts',
};

/**
 * Default Editor Settings
 */
export const DEFAULT_EDITOR_SETTINGS = {
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: {
    enabled: false,
  },
  lineNumbers: 'on',
  automaticLayout: true,
}; 